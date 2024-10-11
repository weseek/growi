import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';

import type Crowi from '~/server/crowi';
import { openaiClient } from '~/server/service/openai';
import { getOpenaiService } from '~/server/service/openai/openai';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import type { ApiV3Response } from '../interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:openai:thread');

type CreateThreadReq = Request<undefined, ApiV3Response, {
  userMessage: string,
  threadId?: string,
}>

type CreateThreadFactory = (crowi: Crowi) => RequestHandler[];

export const createThreadHandlersFactory: CreateThreadFactory = (crowi) => {
  const accessTokenParser = require('../../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    body('threadId').optional().isString().withMessage('threadId must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, validator, apiV3FormValidator,
    async(req: CreateThreadReq, res: ApiV3Response) => {
      const openaiService = getOpenaiService();
      if (openaiService == null) {
        return res.apiv3Err('OpenaiService is not available', 503);
      }

      try {
        const vectorStore = await openaiService.getOrCreateVectorStoreForPublicScope();
        const threadId = req.body.threadId;
        const thread = threadId == null
          ? await openaiClient.beta.threads.create({
            tool_resources: {
              file_search: {
                vector_store_ids: [vectorStore.id],
              },
            },
          })
          : await openaiClient.beta.threads.retrieve(threadId);

        return res.apiv3({ thread });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    },
  ];
};
