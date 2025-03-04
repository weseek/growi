import { Readable } from 'stream';

import type { IUserHasId } from '@growi/core/dist/interfaces';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler, Response } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { AssistantStream } from 'openai/lib/AssistantStream';
import type { MessageDelta } from 'openai/resources/beta/threads/messages.mjs';
import { z } from 'zod';

// 必要なインポート
import { getOrCreateEditorAssistant } from '~/features/openai/server/services/assistant';
import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { MessageErrorCode } from '../../../interfaces/message-error';
import { openaiClient } from '../../services/client';
import { getStreamErrorCode } from '../../services/getStreamErrorCode';
import { getOpenaiService } from '../../services/openai';
import { replaceAnnotationWithPageLink } from '../../services/replace-annotation-with-page-link';
import { certifyAiService } from '../middlewares/certify-ai-service';
import { JsonStreamProcessor } from '../utils/json-stream-processor';
import { SseHelper } from '../utils/sse-helper';

const logger = loggerFactory('growi:routes:apiv3:openai:message');

// -----------------------------------------------------------------------------
// 型定義
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// ユーティリティ関数 (外形のみ)
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// エディターデータプロセッサ実装 (外形のみ)
// -----------------------------------------------------------------------------

/**
 * EditorAssistant用のストリームデータプロセッサ
 * JSONストリームから編集用のメッセージと差分を抽出する
 */
class EditorStreamProcessor {

  // JSONプロセッサ
  private jsonProcessor: JsonStreamProcessor;

  // 確認済みのデータ
  private messages: string[] = [];

  private replacements: EditorAssistantDiff[] = [];

  // ハンドラーID
  private handlerIds: string[] = [];

  constructor(private sseHelper: SseHelper) {
    // JsonStreamProcessorの初期化
    this.jsonProcessor = new JsonStreamProcessor();
    this.setupHandlers();
  }

  /**
   * 処理ハンドラーを設定
   */
  private setupHandlers(): void {
    // コンテンツ配列ハンドラー
    this.handlerIds.push(
      this.jsonProcessor.registerHandler(
        (value): value is { contents: unknown[] } => {
          return typeof value === 'object' && value !== null && 'contents' in value && Array.isArray(value.contents);
        },
        data => this.handleContents(data.contents),
      ),
    );

    // 単一メッセージハンドラー
    this.handlerIds.push(
      this.jsonProcessor.registerHandler(
        isMessageItem,
        message => this.handleMessage(message.message),
      ),
    );

    // 単一差分ハンドラー
    this.handlerIds.push(
      this.jsonProcessor.registerHandler(
        isDiffItem,
        diff => this.handleDiff(diff),
      ),
    );
  }

  /**
   * JSON文字列を処理
   */
  process(jsonString: string): void {
    this.jsonProcessor.process(jsonString);
  }

  /**
   * コンテンツ配列を処理
   */
  private handleContents(contents: unknown[]): void {
    const extracted = extractContentItems(contents);

    let hasUpdates = false;

    // メッセージ処理
    extracted.messages.forEach((msg) => {
      if (!this.messages.includes(msg)) {
        this.messages.push(msg);
        hasUpdates = true;
      }
    });

    // 差分処理
    extracted.replacements.forEach((diff) => {
      const existingIndex = this.replacements.findIndex(r => r.start === diff.start && r.end === diff.end);
      if (existingIndex >= 0) {
        this.replacements[existingIndex] = diff;
      }
      else {
        this.replacements.push(diff);
      }
      hasUpdates = true;
    });

    // 更新があればクライアントに通知
    if (hasUpdates) {
      this.notifyClient();
    }
  }

  /**
   * 単一メッセージを処理
   */
  private handleMessage(message: string): void {
    if (!this.messages.includes(message)) {
      this.messages.push(message);
      this.notifyClient();
    }
  }

  /**
   * 単一差分を処理
   */
  private handleDiff(diff: EditorAssistantDiff): void {
    const validDiff = EditorAssistantDiffSchema.safeParse(diff);
    if (!validDiff.success) return;

    const existingIndex = this.replacements.findIndex(r => r.start === diff.start && r.end === diff.end);
    if (existingIndex >= 0) {
      this.replacements[existingIndex] = validDiff.data;
    }
    else {
      this.replacements.push(validDiff.data);
    }

    this.notifyClient();
  }

  /**
   * クライアントに通知
   */
  private notifyClient(): void {
    this.sseHelper.writeData(createEditorResponse(this.messages, this.replacements));
  }

  /**
   * リソースを解放
   */
  destroy(): void {
    // ハンドラー登録解除
    this.handlerIds.forEach((id) => {
      this.jsonProcessor.unregisterHandler(id);
    });

    // プロセッサ解放
    this.jsonProcessor.destroy();
  }

  /**
   * 最終結果を送信
   */
  sendFinalResult(rawBuffer: string): void {
    try {
      // 完全なJSONをパース
      const parsedJson = JSON.parse(rawBuffer);

      if (parsedJson?.contents && Array.isArray(parsedJson.contents)) {
        // 最終的なコンテンツを抽出
        const extracted = extractContentItems(parsedJson.contents);

        // 最終データを送信（完全なデータがあればそちらを優先）
        this.sseHelper.writeData(createEditorResponse(
          extracted.messages.length > 0 ? extracted.messages : this.messages,
          extracted.replacements.length > 0 ? extracted.replacements : this.replacements,
          true, // 完了フラグ
        ));
      }
      else if (this.messages.length > 0 || this.replacements.length > 0) {
        // パース結果が期待形式でなくても蓄積データがあれば送信
        this.sseHelper.writeData(createEditorResponse(this.messages, this.replacements, true));
      }
      else {
        // データがない場合はエラー
        this.sseHelper.writeError('Failed to parse assistant response as JSON', 'INVALID_RESPONSE_FORMAT');
      }
    }
    catch (e) {
      logger.debug('Failed to parse final JSON response:', e);

      // パースエラー時も蓄積データがあれば送信
      if (this.messages.length > 0 || this.replacements.length > 0) {
        this.sseHelper.writeData(createEditorResponse(this.messages, this.replacements, true));
      }
      else {
        this.sseHelper.writeError('Failed to parse assistant response as JSON', 'INVALID_RESPONSE_FORMAT');
      }
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

// -----------------------------------------------------------------------------
// エンドポイントハンドラーファクトリ
// -----------------------------------------------------------------------------

type PostMessageHandlersFactory = (crowi: Crowi) => RequestHandler[];

/**
 * エディタアシスタントのエンドポイントハンドラを作成する
 */
export const postMessageToEditHandlersFactory: PostMessageHandlersFactory = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  // バリデータ設定
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

      // SSEヘルパーとストリームプロセッサの初期化
      const sseHelper = new SseHelper(res);
      const streamProcessor = new EditorStreamProcessor(sseHelper);

      try {
        // レスポンスヘッダー設定
        res.writeHead(200, {
          'Content-Type': 'text/event-stream;charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        });

        let rawBuffer = '';

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

            // JSONプロセッサでデータを処理
            streamProcessor.process(rawBuffer);

            // 元のデルタも送信
            sseHelper.writeData(delta);
          }
          else {
            sseHelper.writeData(delta);
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
            sseHelper.writeError(errorMessage, getStreamErrorCode(errorMessage));
          }
        });

        // 完了ハンドラ
        stream.once('messageDone', () => {
          // 最終結果を処理して送信
          streamProcessor.sendFinalResult(rawBuffer);

          // ストリームのクリーンアップ
          streamProcessor.destroy();
          stream.off('messageDelta', messageDeltaHandler);
          sseHelper.end();
        });

        // エラーハンドラ
        stream.once('error', (err) => {
          logger.error('Stream error:', err);

          // クリーンアップ
          streamProcessor.destroy();
          stream.off('messageDelta', messageDeltaHandler);
          sseHelper.writeError('An error occurred while processing your request');
          sseHelper.end();
        });

        // クライアント切断時のクリーンアップ
        req.on('close', () => {
          streamProcessor.destroy();

          if (stream) {
            stream.off('messageDelta', () => {});
            stream.off('event', () => {});
          }

          logger.debug('Connection closed by client');
        });
      }
      catch (err) {
        // エラー発生時のクリーンアップと応答
        logger.error('Error in edit handler:', err);
        streamProcessor.destroy();
        return res.status(500).send(err.message);
      }
    },
  ];
};
