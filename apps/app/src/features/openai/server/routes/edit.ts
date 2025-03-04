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

/**
 * 単一の JSON パーサーインスタンスを作成して継続的に使用する
 * これにより、メモリリークやイベントリスナーの過剰な登録を防止する
 */
class JsonStreamProcessor {

  // パーサーコンポーネント
  private jsonParser = parser({ jsonStreaming: true });

  private jsonValueStream = streamValues();

  // 内部状態
  private messages: string[] = [];

  private replacements: EditorAssistantDiff[] = [];

  private dataCallback: ((messages: string[], replacements: EditorAssistantDiff[]) => void) | null = null;

  private isSetup = false;

  constructor() {
    // リスナー上限を増やしてワーニングを防止
    this.jsonParser.setMaxListeners(20);
    this.jsonValueStream.setMaxListeners(20);

    // エラーハンドリング設定
    this.jsonParser.on('error', (err) => {
      logger.debug('JSON parser error (expected for partial data):', err.message);
    });

    this.jsonValueStream.on('error', (err) => {
      logger.debug('Stream values error (expected for partial data):', err.message);
    });

    // データハンドラ
    this.jsonValueStream.on('data', ({ value }) => {
      if (!value) return;

      try {
        // コンテンツアレイから抽出
        if (value.contents && Array.isArray(value.contents)) {
          // 全コンテンツを抽出
          const extracted = extractContentItems(value.contents);

          // 新しいメッセージを追加
          extracted.messages.forEach((message) => {
            if (!this.messages.includes(message)) {
              this.messages.push(message);
            }
          });

          // 新しい差分を追加/更新
          extracted.replacements.forEach((diff) => {
            const existingIndex = this.replacements.findIndex(r => r.start === diff.start && r.end === diff.end);
            if (existingIndex >= 0) {
              this.replacements[existingIndex] = diff;
            }
            else {
              this.replacements.push(diff);
            }
          });

          // データが見つかったらコールバックを実行
          if ((extracted.messages.length > 0 || extracted.replacements.length > 0) && this.dataCallback) {
            this.dataCallback(this.messages, this.replacements);
          }
        }
        // 個別のメッセージアイテム
        else if (isMessageItem(value)) {
          if (!this.messages.includes(value.message)) {
            this.messages.push(value.message);
            if (this.dataCallback) this.dataCallback(this.messages, this.replacements);
          }
        }
        // 個別の差分アイテム
        else if (isDiffItem(value)) {
          const validDiff = EditorAssistantDiffSchema.safeParse(value);
          if (validDiff.success) {
            const diff = validDiff.data;
            const existingIndex = this.replacements.findIndex(r => r.start === diff.start && r.end === diff.end);
            if (existingIndex >= 0) {
              this.replacements[existingIndex] = diff;
            }
            else {
              this.replacements.push(diff);
            }
            if (this.dataCallback) this.dataCallback(this.messages, this.replacements);
          }
        }
      }
      catch (e) {
        logger.debug('Error processing JSON data:', e);
      }
    });

    // パイプライン接続
    this.jsonParser.pipe(this.jsonValueStream);
    this.isSetup = true;
  }

  /**
   * データ処理のコールバックを設定
   */
  onData(callback: (messages: string[], replacements: EditorAssistantDiff[]) => void): void {
    this.dataCallback = callback;
  }

  /**
   * JSON文字列を処理
   */
  process(jsonString: string): void {
    try {
      // パーサーにデータを書き込む
      // 注: pipe()は使わず、直接write()することでリスナーの増加を防ぐ
      this.jsonParser.write(jsonString);
    }
    catch (e) {
      logger.debug('Error processing JSON data:', e);
    }
  }

  /**
   * リソースを解放
   */
  destroy(): void {
    try {
      if (this.isSetup) {
        this.jsonParser.unpipe(this.jsonValueStream);
        this.jsonParser.removeAllListeners();
        this.jsonValueStream.removeAllListeners();
        this.jsonParser.end();
        this.jsonValueStream.end();
        this.dataCallback = null;
        this.isSetup = false;
      }
    }
    catch (e) {
      logger.debug('Error destroying JSON processor:', e);
    }
  }

  /**
   * 現在のメッセージリスト
   */
  get messagesList(): string[] {
    return this.messages;
  }

  /**
   * 現在の差分リスト
   */
  get replacementsList(): EditorAssistantDiff[] {
    return this.replacements;
  }

}

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

      // レスポンスヘッダー設定
      res.writeHead(200, {
        'Content-Type': 'text/event-stream;charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      });

      // JSONプロセッサ作成 - 単一インスタンスを管理
      const jsonProcessor = new JsonStreamProcessor();

      // データが見つかるたびにクライアントに送信
      jsonProcessor.onData((messages, replacements) => {
        writeSSEData(res, createEditorResponse(messages, replacements));
      });

      let stream: AssistantStream;
      let rawBuffer = '';

      try {
        // アシスタント取得とスレッド処理
        const assistant = await getOrCreateEditorAssistant();
        const thread = await openaiClient.beta.threads.retrieve(threadId);

        // ストリーム作成
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

            // JSONプロセッサでデータを処理
            jsonProcessor.process(rawBuffer);

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
                extracted.messages.length > 0 ? extracted.messages : jsonProcessor.messagesList,
                extracted.replacements.length > 0 ? extracted.replacements : jsonProcessor.replacementsList,
                true,
              ));
            }
            else if (jsonProcessor.messagesList.length > 0 || jsonProcessor.replacementsList.length > 0) {
              // パース結果が期待形式でなくても、部分的なデータがあれば送信
              writeSSEData(res, createEditorResponse(jsonProcessor.messagesList, jsonProcessor.replacementsList, true));
            }
          }
          catch (e) {
            logger.debug('Failed to parse final JSON response', e);

            if (jsonProcessor.messagesList.length > 0 || jsonProcessor.replacementsList.length > 0) {
              // パース失敗でも、既存データがあれば送信
              writeSSEData(res, createEditorResponse(jsonProcessor.messagesList, jsonProcessor.replacementsList, true));
            }
            else {
              writeSSEError(res, 'Failed to parse assistant response as JSON', 'INVALID_RESPONSE_FORMAT');
            }
          }

          // JSONプロセッサとストリームのクリーンアップ
          jsonProcessor.destroy();
          stream.off('messageDelta', messageDeltaHandler);
          res.end();
        });

        // エラーハンドラ
        stream.once('error', (err) => {
          logger.error('Stream error:', err);

          // JSONプロセッサとストリームのクリーンアップ
          jsonProcessor.destroy();
          stream.off('messageDelta', messageDeltaHandler);
          writeSSEError(res, 'An error occurred while processing your request');
          res.end();
        });

        // クリーンアップ関数を設定
        req.on('close', () => {
          jsonProcessor.destroy();

          if (stream) {
            stream.off('messageDelta', () => {});
            stream.off('event', () => {});
          }

          logger.debug('Connection closed by client');
        });
      }
      catch (err) {
        // エラー発生時のクリーンアップ
        jsonProcessor.destroy();
        logger.error('Unexpected error:', err);
        return res.status(500).send(err.message);
      }
    },
  ];
};
