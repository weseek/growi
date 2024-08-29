import assert from 'assert';

import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import type { AssistantStream } from 'openai/lib/AssistantStream';

import type Crowi from '~/server/crowi';
import { openaiClient } from '~/server/service/openai';
import { getOrCreateChatAssistant } from '~/server/service/openai/assistant';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import type { ApiV3Response } from '../interfaces/apiv3-response';


const logger = loggerFactory('growi:routes:apiv3:openai:chat');

type ReqBody = {
  userMessage: string,
  threadId?: string,
}

type Req = Request<undefined, ApiV3Response, ReqBody>

type PostMessageHandlersFactory = (crowi: Crowi) => RequestHandler[];

export const postMessageHandlersFactory: PostMessageHandlersFactory = (crowi) => {
  const accessTokenParser = require('../../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    body('userMessage').isString().withMessage('userMessage must be string'),
    body('threadId').isString().withMessage('threadId must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {

      const threadId = req.body.threadId;

      assert(threadId != null);

      let stream: AssistantStream;

      try {
        const assistant = await getOrCreateChatAssistant();

        const thread = await openaiClient.beta.threads.retrieve(threadId);

        stream = openaiClient.beta.threads.runs.stream(thread.id, {
          assistant_id: assistant.id,
          additional_messages: [{ role: 'assistant', content: req.body.userMessage }],
        });

      }
      catch (err) {
        logger.error(err);
        return res.status(500).send(err);
      }

      res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-Accel-Buffering', 'no');

      try {
        res.send(stream.toReadableStream());
      }
      catch (e) {
        return res.status(500).send({ message: 'Internal server error', error: e });
      }
      finally {
        res.end();
      }

    },
  ];
};
