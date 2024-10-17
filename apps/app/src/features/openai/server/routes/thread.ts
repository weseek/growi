import type { IUserHasId } from '@growi/core/dist/interfaces';
import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import { filterXSS } from 'xss';

import type Crowi from '~/server/crowi';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:thread');

type CreateThreadReq = Request<undefined, ApiV3Response, { threadId?: string }> & { user: IUserHasId };

type CreateThreadFactory = (crowi: Crowi) => RequestHandler[];

export const createThreadHandlersFactory: CreateThreadFactory = (crowi) => {
  const accessTokenParser = require('~/server/middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    body('threadId').optional().isString().withMessage('threadId must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService, validator, apiV3FormValidator,
    async(req: CreateThreadReq, res: ApiV3Response) => {
      try {
        const filterdThreadId = req.body.threadId != null ? filterXSS(req.body.threadId) : undefined;
        const openaiService = getOpenaiService();
        const thread = await openaiService?.getOrCreateThread(req.user._id, filterdThreadId);
        return res.apiv3({ thread });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    },
  ];
};
