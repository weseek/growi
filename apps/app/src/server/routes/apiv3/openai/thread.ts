import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';

import type Crowi from '~/server/crowi';
import { openaiClient } from '~/server/service/openai';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import type { ApiV3Response } from '../interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:openai:chat');

type ReqBody = {
  userMessage: string,
  threadId?: string,
}

type Req = Request<undefined, ApiV3Response, ReqBody>

type CreateThreadFactory = (crowi: Crowi) => RequestHandler[];

export const createThreadHandlersFactory: CreateThreadFactory = (crowi) => {
  const accessTokenParser = require('../../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    body('threadId').optional().isString().withMessage('threadId must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {

      const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
      if (vectorStoreId == null) {
        return res.apiv3Err('OPENAI_VECTOR_STORE_ID is not setup', 503);
      }

      try {
        const threadId = req.body.threadId;
        const thread = threadId == null
          ? await openaiClient.beta.threads.create({
            tool_resources: {
              file_search: {
                vector_store_ids: [vectorStoreId],
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
