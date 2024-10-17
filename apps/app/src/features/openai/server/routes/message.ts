import assert from 'assert';

import type { Request, RequestHandler, Response } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import type { AssistantStream } from 'openai/lib/AssistantStream';
import type { MessageDelta } from 'openai/resources/beta/threads/messages.mjs';

import { getOrCreateChatAssistant } from '~/features/openai/server/services/assistant';
import type Crowi from '~/server/crowi';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import loggerFactory from '~/utils/logger';

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
    body('threadId').isString().withMessage('threadId must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService, validator, apiV3FormValidator,
    async(req: Req, res: Response) => {

      const threadId = req.body.threadId;

      assert(threadId != null);

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

        // TODO: improve error handling by https://redmine.weseek.co.jp/issues/155304
        return res.status(500).send(err.message);
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream;charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      });

      const messageDeltaHandler = (delta: MessageDelta) => {
        res.write(`data: ${JSON.stringify(delta)}\n\n`);
      };

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
