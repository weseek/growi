import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';

import type Crowi from '~/server/crowi';
import { configManager } from '~/server/service/config-manager';
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

type ChatHandlersFactory = (crowi: Crowi) => RequestHandler[];

export const chatHandlersFactory: ChatHandlersFactory = (crowi) => {
  const accessTokenParser = require('../../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    body('userMessage').isString().withMessage('userMessage must be string'),
    body('threadId').optional().isString().withMessage('threadId must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {
      const vectorStoreId = configManager.getConfig('crowi', 'app:openaiVectorStoreId');
      if (vectorStoreId == null) {
        return res.apiv3Err('OPENAI_VECTOR_STORE_ID is not setup', 503);
      }

      try {
        const assistant = await getOrCreateChatAssistant();

        const threadId = req.body.threadId;
        const thread = threadId == null
          ? await openaiClient.beta.threads.create({
            messages: [{ role: 'assistant', content: req.body.userMessage }],
            tool_resources: {
              file_search: {
                vector_store_ids: [vectorStoreId],
              },
            },
          })
          : await openaiClient.beta.threads.retrieve(threadId);

        const run = await openaiClient.beta.threads.runs.createAndPoll(thread.id, { assistant_id: assistant.id });

        if (run.status === 'completed') {
          const messages = await openaiClient.beta.threads.messages.list(run.thread_id, {
            limit: 1,
            order: 'desc',
          });
          return res.apiv3({ messages });
        }

        return res.apiv3({});
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    },
  ];
};
