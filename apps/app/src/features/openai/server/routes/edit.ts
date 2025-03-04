import { Readable } from 'stream';

import type { IUserHasId } from '@growi/core/dist/interfaces';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler, Response } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { AssistantStream } from 'openai/lib/AssistantStream';
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

// 差分情報のスキーマ定義
const EditorAssistantMessageSchema = z.object({
  message: z.string().describe('A friendly message explaining what changes were made or suggested'),
});

const EditorAssistantDiffSchema = z.object({
  start: z.number().int().describe('Zero-based index where replacement should begin'),
  end: z.number().int().describe('Zero-based index where replacement should end'),
  text: z.string().describe('The text that should replace the content between start and end positions'),
});

// 新しいレスポンス形式:
const EditorAssistantResponseSchema = z.object({
  contents: z.array(z.union([EditorAssistantMessageSchema, EditorAssistantDiffSchema])),
}).describe('The response format for the editor assistant');

// 型定義をZodスキーマから抽出
type EditorAssistantMessage = z.infer<typeof EditorAssistantMessageSchema>;
type EditorAssistantDiff = z.infer<typeof EditorAssistantDiffSchema>;
type EditorAssistantResponse = z.infer<typeof EditorAssistantResponseSchema>;

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
      const {
        userMessage, markdown, aiAssistantId, threadId,
      } = req.body;

      if (threadId == null) {
        return res.apiv3Err(new ErrorV3('threadId is not set', MessageErrorCode.THREAD_ID_IS_NOT_SET), 400);
      }

      const openaiService = getOpenaiService();
      if (openaiService == null) {
        return res.apiv3Err(new ErrorV3('GROWI AI is not enabled'), 501);
      }

      let stream: AssistantStream;

      try {
        const assistant = await getOrCreateEditorAssistant();

        const thread = await openaiClient.beta.threads.retrieve(threadId);

        // zodResponseFormatを使用して構造化された出力を得る
        stream = openaiClient.beta.threads.runs.stream(thread.id, {
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
      }
      catch (err) {
        logger.error(err);
        return res.status(500).send(err.message);
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream;charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      });

      // JSON解析用の変数
      let rawBuffer = ''; // 完全な生の入力データを格納

      // クライアントに送信するためのデータ
      const messages: string[] = []; // 見つかったメッセージを格納
      const replacements: EditorAssistantDiff[] = []; // 見つかった差分を格納

      const messageDeltaHandler = async(delta: MessageDelta) => {
        const content = delta.content?.[0];

        // アノテーション処理は同様に行う
        if (content?.type === 'text' && content?.text?.annotations != null) {
          await replaceAnnotationWithPageLink(content, req.user.lang);
        }

        if (content?.type === 'text' && content.text?.value) {
          const chunk = content.text.value;
          rawBuffer += chunk;

          // バッファからストリームを作成
          const bufferStream = Readable.from([rawBuffer]);

          // JSONパーサーを設定
          const jsonParser = bufferStream.pipe(parser()).pipe(streamValues());

          jsonParser.on('data', ({ value, key }) => {
            // contentsアレイ内の要素を検出
            if (Array.isArray(value.contents)) {
              // 完全なcontentsアレイが見つかった場合
              value.contents.forEach((item) => {
                if ('message' in item) {
                  messages.push(item.message);
                }
                else if ('start' in item && 'end' in item && 'text' in item) {
                  const validDiff = EditorAssistantDiffSchema.safeParse(item);
                  if (validDiff.success) {
                    replacements.push(validDiff.data);
                  }
                }
              });

              // 更新をクライアントに送信
              res.write(`data: ${JSON.stringify({
                editorResponse: {
                  message: messages.length > 0 ? messages[messages.length - 1] : '',
                  replacements,
                },
              })}\n\n`);
            }
          });

          // 元のデルタも送信
          res.write(`data: ${JSON.stringify(delta)}\n\n`);
        }
        else {
          res.write(`data: ${JSON.stringify(delta)}\n\n`);
        }
      };

      const sendError = (message: string, code?: StreamErrorCode) => {
        res.write(`error: ${JSON.stringify({ code, message })}\n\n`);
      };

      stream.on('event', (delta) => {
        if (delta.event === 'thread.run.failed') {
          const errorMessage = delta.data.last_error?.message;
          if (errorMessage == null) {
            return;
          }
          logger.error(errorMessage);
          sendError(errorMessage, getStreamErrorCode(errorMessage));
        }
      });

      stream.on('messageDelta', messageDeltaHandler);

      stream.once('messageDone', () => {
        // 処理完了時、最終的なレスポンスを送信
        // 最後の確認としてJSONを解析してみる
        try {
          // バッファから完全なJSONを解析
          const parsedJson = JSON.parse(rawBuffer);

          if (parsedJson?.contents && Array.isArray(parsedJson.contents)) {
            // 最終的なメッセージと差分を収集
            const finalMessages: string[] = [];
            const finalReplacements: EditorAssistantDiff[] = [];

            for (const item of parsedJson.contents) {
              if ('message' in item) {
                finalMessages.push(item.message);
              }
              else if ('start' in item && 'end' in item && 'text' in item) {
                const validDiff = EditorAssistantDiffSchema.safeParse(item);
                if (validDiff.success) {
                  finalReplacements.push(validDiff.data);
                }
              }
            }

            // 最終レスポンスをクライアントに送信（これまでに部分的に送信したものがあっても、完全なデータを再送）
            res.write(`data: ${JSON.stringify({
              editorResponse: {
                message: finalMessages.length > 0 ? finalMessages[finalMessages.length - 1] : '',
                replacements: finalReplacements,
              },
              isDone: true,
            })}\n\n`);
          }
          else {
            // 既に部分的に送信したデータがある場合はそれを最終データとして扱う
            res.write(`data: ${JSON.stringify({
              editorResponse: {
                message: messages.length > 0 ? messages[messages.length - 1] : '',
                replacements,
              },
              isDone: true,
            })}\n\n`);
          }
        }
        catch (e) {
          logger.error('Failed to parse final JSON response', e);
          // パース失敗時で既存のデータがある場合はそれを送信
          if (messages.length > 0 || replacements.length > 0) {
            res.write(`data: ${JSON.stringify({
              editorResponse: {
                message: messages.length > 0 ? messages[messages.length - 1] : '',
                replacements,
              },
              isDone: true,
            })}\n\n`);
          }
          else {
            sendError('Failed to parse assistant response as JSON', 'INVALID_RESPONSE_FORMAT');
          }
        }

        stream.off('messageDelta', messageDeltaHandler);
        res.end();
      });

      stream.once('error', (err) => {
        logger.error(err);
        stream.off('messageDelta', messageDeltaHandler);
        sendError('An error occurred while processing your request');
        res.end();
      });
    },
  ];
};
