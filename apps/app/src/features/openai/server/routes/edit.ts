import { Readable } from 'stream';

import type { IUserHasId } from '@growi/core/dist/interfaces';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler, Response } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { MessageDelta } from 'openai/resources/beta/threads/messages.mjs';
import { parser } from 'stream-json';
import { streamValues } from 'stream-json/streamers/StreamValues';
import { z } from 'zod';

import { getOrCreateEditorAssistant } from '~/features/openai/server/services/assistant';
import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { MessageErrorCode, type StreamErrorCode } from '../../interfaces/message-error';
import { openaiClient } from '../services/client';
import { getStreamErrorCode } from '../services/getStreamErrorCode';
import { getOpenaiService } from '../services/openai';
import { replaceAnnotationWithPageLink } from '../services/replace-annotation-with-page-link';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:message');

// スキーマ定義
const EditorAssistantMessageSchema = z.object({
  message: z.string().describe('A friendly message explaining what changes were made or suggested'),
});

const EditorAssistantDiffSchema = z.object({
  start: z.number().int().describe('Zero-based index where replacement should begin'),
  end: z.number().int().describe('Zero-based index where replacement should end'),
  text: z.string().describe('The text that should replace the content between start and end positions'),
});

const EditorAssistantResponseSchema = z.object({
  contents: z.array(z.union([EditorAssistantMessageSchema, EditorAssistantDiffSchema])),
}).describe('The response format for the editor assistant');

// 型定義
type EditorAssistantMessage = z.infer<typeof EditorAssistantMessageSchema>;
type EditorAssistantDiff = z.infer<typeof EditorAssistantDiffSchema>;

type ReqBody = {
  userMessage: string,
  markdown: string,
  aiAssistantId?: string,
  threadId?: string,
}
type Req = Request<undefined, Response, ReqBody> & {
  user: IUserHasId,
}
type PostMessageHandlersFactory = (crowi: Crowi) => RequestHandler[];

/**
 * 型ガード: メッセージ型かどうかを判定する
 */
const isMessageItem = (item: unknown): item is EditorAssistantMessage => {
  return typeof item === 'object' && item !== null && 'message' in item;
};

/**
 * 型ガード: 差分型かどうかを判定する
 */
const isDiffItem = (item: unknown): item is EditorAssistantDiff => {
  return typeof item === 'object' && item !== null
    && 'start' in item && 'end' in item && 'text' in item;
};

/**
 * コンテンツからメッセージと差分を抽出する
 */
const extractContentItems = (contents: unknown[]) => {
  const messages: string[] = [];
  const replacements: EditorAssistantDiff[] = [];

  contents.forEach((item) => {
    if (isMessageItem(item)) {
      messages.push(item.message);
    }
    else if (isDiffItem(item)) {
      const validDiff = EditorAssistantDiffSchema.safeParse(item);
      if (validDiff.success) {
        replacements.push(validDiff.data);
      }
    }
  });

  return { messages, replacements };
};

/**
 * エディターアシスタントのレスポンスデータを作成する
 */
const createEditorResponse = (messages: string[], replacements: EditorAssistantDiff[], isDone = false) => ({
  editorResponse: {
    message: messages.length > 0 ? messages[messages.length - 1] : '',
    replacements,
  },
  ...(isDone ? { isDone: true } : {}),
});

/**
 * SSEフォーマットでデータを送信する
 */
const writeSSEData = (res: Response, data: unknown) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

/**
 * SSEフォーマットでエラーを送信する
 */
const writeSSEError = (res: Response, message: string, code?: StreamErrorCode) => {
  res.write(`error: ${JSON.stringify({ code, message })}\n\n`);
};

export const postMessageToEditHandlersFactory: PostMessageHandlersFactory = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    body('userMessage')
      .isString()
      .withMessage('userMessage must be string')
      .notEmpty()
      .withMessage('userMessage must be set'),
    body('markdown')
      .isString()
      .withMessage('markdown must be string')
      .notEmpty()
      .withMessage('markdown must be set'),
    body('aiAssistantId').optional().isMongoId().withMessage('aiAssistantId must be string'),
    body('threadId').optional().isString().withMessage('threadId must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {
      const { userMessage, markdown, threadId } = req.body;

      // パラメータチェック
      if (threadId == null) {
        return res.apiv3Err(new ErrorV3('threadId is not set', MessageErrorCode.THREAD_ID_IS_NOT_SET), 400);
      }

      // サービスチェック
      const openaiService = getOpenaiService();
      if (openaiService == null) {
        return res.apiv3Err(new ErrorV3('GROWI AI is not enabled'), 501);
      }

      // レスポンスデータ格納用
      const messages: string[] = [];
      const replacements: EditorAssistantDiff[] = [];
      let rawBuffer = '';

      try {
        // レスポンスヘッダー設定
        res.writeHead(200, {
          'Content-Type': 'text/event-stream;charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        });

        // アシスタント取得とスレッド処理
        const assistant = await getOrCreateEditorAssistant();
        const thread = await openaiClient.beta.threads.retrieve(threadId);

        // ストリーム作成
        const stream = openaiClient.beta.threads.runs.stream(thread.id, {
          assistant_id: assistant.id,
          additional_messages: [
            {
              role: 'assistant',
              content: `You are an Editor Assistant for GROWI, a markdown wiki system.
              Your task is to help users edit their markdown content based on their requests.

              RESPONSE FORMAT:
              You must respond with a JSON object in the following format:
              {
                "contents": [
                  { "message": "Your friendly message explaining what changes were made or suggested" },
                  { "start": 0, "end": 10, "text": "New text 1" },
                  { "message": "Additional explanation if needed" },
                  { "start": 20, "end": 30, "text": "New text 2" },
                  ...more items if needed
                ]
              }

              The array should contain:
              - Objects with a "message" key for explanatory text to the user
              - Objects with "start", "end", and "text" keys for replacements

              If no changes are needed, include only message objects with explanations.
              Always provide messages in the same language as the user's request.`,
            },
            {
              role: 'user',
              content: `Current markdown content:\n\`\`\`markdown\n${markdown}\n\`\`\`\n\nUser request: ${userMessage}`,
            },
          ],
          response_format: zodResponseFormat(EditorAssistantResponseSchema, 'editor_assistant_response'),
        });

        // メッセージデルタハンドラ
        const messageDeltaHandler = async(delta: MessageDelta) => {
          const content = delta.content?.[0];

          // アノテーション処理
          if (content?.type === 'text' && content?.text?.annotations != null) {
            await replaceAnnotationWithPageLink(content, req.user.lang);
          }

          // テキスト処理
          if (content?.type === 'text' && content.text?.value) {
            const chunk = content.text.value;
            rawBuffer += chunk;

            // JSONパース処理
            try {
              // ストリームから解析
              const bufferStream = Readable.from([rawBuffer]);
              const jsonParser = bufferStream.pipe(parser()).pipe(streamValues());

              jsonParser.on('data', ({ value }) => {
                // contentsアレイの処理
                if (value?.contents && Array.isArray(value.contents)) {
                  // メッセージと差分情報の抽出
                  const extracted = extractContentItems(value.contents);
                  messages.push(...extracted.messages);
                  replacements.push(...extracted.replacements);

                  // データ送信
                  writeSSEData(res, createEditorResponse(messages, replacements));
                }
              });
            }
            catch (e) {
              // JSON解析中のエラーは無視(おそらく不完全なJSONデータ)
            }

            // 元のデルタも送信
            writeSSEData(res, delta);
          }
          else {
            writeSSEData(res, delta);
          }
        };

        // イベントハンドラ登録
        stream.on('messageDelta', messageDeltaHandler);

        // Runエラーハンドラ
        stream.on('event', (delta) => {
          if (delta.event === 'thread.run.failed') {
            const errorMessage = delta.data.last_error?.message;
            if (errorMessage == null) return;

            logger.error(errorMessage);
            writeSSEError(res, errorMessage, getStreamErrorCode(errorMessage));
          }
        });

        // 完了ハンドラ
        stream.once('messageDone', () => {
          // 最終確認として完全なJSONをパース
          try {
            const parsedJson = JSON.parse(rawBuffer);

            if (parsedJson?.contents && Array.isArray(parsedJson.contents)) {
              // 最終的なメッセージと差分を収集
              const extracted = extractContentItems(parsedJson.contents);

              // 最終データ送信
              writeSSEData(res, createEditorResponse(
                extracted.messages.length > 0 ? extracted.messages : messages,
                extracted.replacements.length > 0 ? extracted.replacements : replacements,
                true,
              ));
            }
            else if (messages.length > 0 || replacements.length > 0) {
              // パース結果が期待形式でなくても、部分的なデータがあれば送信
              writeSSEData(res, createEditorResponse(messages, replacements, true));
            }
          }
          catch (e) {
            logger.error('Failed to parse final JSON response', e);

            if (messages.length > 0 || replacements.length > 0) {
              // パース失敗でも、既存データがあれば送信
              writeSSEData(res, createEditorResponse(messages, replacements, true));
            }
            else {
              writeSSEError(res, 'Failed to parse assistant response as JSON', 'INVALID_RESPONSE_FORMAT');
            }
          }

          stream.off('messageDelta', messageDeltaHandler);
          res.end();
        });

        // エラーハンドラ
        stream.once('error', (err) => {
          logger.error(err);
          stream.off('messageDelta', messageDeltaHandler);
          writeSSEError(res, 'An error occurred while processing your request');
          res.end();
        });
      }
      catch (err) {
        logger.error(err);
        return res.status(500).send(err.message);
      }
    },
  ];
};
