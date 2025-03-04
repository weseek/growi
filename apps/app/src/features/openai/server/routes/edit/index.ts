import type { IUserHasId } from '@growi/core/dist/interfaces';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler, Response } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import { zodResponseFormat } from 'openai/helpers/zod';
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
import { SseHelper } from '../utils/sse-helper';

import { EditorStreamProcessor } from './editor-stream-processor';
import { EditorAssistantDiffSchema, EditorAssistantMessageSchema } from './schema';

const logger = loggerFactory('growi:routes:apiv3:openai:message');

// -----------------------------------------------------------------------------
// 型定義
// -----------------------------------------------------------------------------

const EditorAssistantResponseSchema = z.object({
  contents: z.array(z.union([EditorAssistantMessageSchema, EditorAssistantDiffSchema])),
}).describe('The response format for the editor assistant');


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
