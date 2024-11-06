import type { IUserHasId } from '@growi/core/dist/interfaces';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler, Response } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import type { AssistantStream } from 'openai/lib/AssistantStream';
import type { MessageDelta } from 'openai/resources/beta/threads/messages.mjs';

import { getOrCreateChatAssistant } from '~/features/openai/server/services/assistant';
import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { MessageErrorCode, type StreamErrorCode } from '../../interfaces/message-error';
import { openaiClient } from '../services';
import { annotationReplacer } from '../services/annotation-replacer';
import { getStreamErrorCode } from '../services/getStreamErrorCode';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:message');


type ReqBody = {
  userMessage: string,
  threadId?: string,
}

type Req = Request<undefined, Response, ReqBody> & {
  user: IUserHasId,
}

type PostMessageHandlersFactory = (crowi: Crowi) => RequestHandler[];

export const postMessageHandlersFactory: PostMessageHandlersFactory = (crowi) => {
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

      const messageDeltaHandler = async(delta: MessageDelta) => {
        await annotationReplacer(delta, req.user.lang);
        res.write(`data: ${JSON.stringify(delta)}\n\n`);
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
