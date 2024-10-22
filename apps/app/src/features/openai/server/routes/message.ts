import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler, Response } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import type { AssistantStream } from 'openai/lib/AssistantStream';
import type { MessageDelta } from 'openai/resources/beta/threads/messages.mjs';

import { getOrCreateChatAssistant } from '~/features/openai/server/services/assistant';
import type Crowi from '~/server/crowi';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { MessageErrorCode, StreamErrorCode } from '../../interfaces/message-error';
import { openaiClient } from '../services';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:message');


type ReqBody = {
  userMessage: string,
  threadId?: string,
}

type Req = Request<undefined, Response, ReqBody>

type PostMessageHandlersFactory = (crowi: Crowi) => RequestHandler[];

export const postMessageHandlersFactory: PostMessageHandlersFactory = (crowi) => {
  const accessTokenParser = require('~/server/middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    body('userMessage')
      .isString()
      .withMessage('userMessage must be string')
      .notEmpty()
      .withMessage('userMessage must be set'),
    body('threadId').optional().isString().withMessage('threadId must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {

      const threadId = req.body.threadId;

      if (threadId == null) {
        return res.apiv3Err(new ErrorV3('threadId is not set', MessageErrorCode.THREAD_ID_IS_NOT_SET), 400);
      }

      let stream: AssistantStream;

      try {
        const assistant = await getOrCreateChatAssistant();

        const thread = await openaiClient.beta.threads.retrieve(threadId);

        stream = openaiClient.beta.threads.runs.stream(thread.id, {
          assistant_id: assistant.id,
          additional_messages: [{ role: 'user', content: req.body.userMessage }],
        });

      }
      catch (err) {
        logger.error(err);

        // TODO: improve error handling by https://redmine.weseek.co.jp/issues/155004
        return res.status(500).send(err.message);
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream;charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      });

      const messageDeltaHandler = (delta: MessageDelta) => {
        res.write(`data: ${JSON.stringify(delta)}\n\n`);
      };

      const sendError = (code: StreamErrorCode, message: string) => {
        res.write(`error: ${JSON.stringify({ code, message })}\n\n`);
      };

      stream.on('event', (delta) => {
        if (delta.event === 'thread.run.failed') {
          if (delta.data.last_error?.code === StreamErrorCode.RATE_LIMIT_EXCEEDED) {
            logger.error(delta.data.last_error.message);
            sendError(StreamErrorCode.RATE_LIMIT_EXCEEDED, delta.data.last_error.message);
          }
        }
      });
      stream.on('messageDelta', messageDeltaHandler);
      stream.once('messageDone', () => {
        stream.off('messageDelta', messageDeltaHandler);
        res.end();
      });
      stream.once('error', (err) => {
        logger.error(err);
        stream.off('messageDelta', messageDeltaHandler);
        res.end();
      });
    },
  ];
};
