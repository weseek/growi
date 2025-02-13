import type { IUserHasId } from '@growi/core/dist/interfaces';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import { filterXSS } from 'xss';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:thread');

type CreateThreadReq = Request<undefined, ApiV3Response, { threadId?: string }> & { user: IUserHasId };

type CreateThreadFactory = (crowi: Crowi) => RequestHandler[];

export const createThreadHandlersFactory: CreateThreadFactory = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    body('threadId').optional().isString().withMessage('threadId must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService, validator, apiV3FormValidator,
    async(req: CreateThreadReq, res: ApiV3Response) => {

      const openaiService = getOpenaiService();
      if (openaiService == null) {
        return res.apiv3Err(new ErrorV3('GROWI AI is not enabled'), 501);
      }

      try {
        const filterdThreadId = req.body.threadId != null ? filterXSS(req.body.threadId) : undefined;
        // const vectorStore = await openaiService?.getOrCreateVectorStoreForPublicScope();
        // const thread = await openaiService?.getOrCreateThread(req.user._id, vectorStore?.vectorStoreId, filterdThreadId);
        return res.apiv3({ });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    },
  ];
};
