import type { IUserHasId } from '@growi/core/dist/interfaces';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:thread');

type ReqBody = {
  aiAssistantId: string,
  initialUserMessage: string,
}

type CreateThreadReq = Request<undefined, ApiV3Response, ReqBody> & { user: IUserHasId };

type CreateThreadFactory = (crowi: Crowi) => RequestHandler[];

export const createThreadHandlersFactory: CreateThreadFactory = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    body('aiAssistantId').isMongoId().withMessage('aiAssistantId must be string'),
    body('initialUserMessage').isString().withMessage('initialUserMessage must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService, validator, apiV3FormValidator,
    async(req: CreateThreadReq, res: ApiV3Response) => {

      const openaiService = getOpenaiService();
      if (openaiService == null) {
        return res.apiv3Err(new ErrorV3('GROWI AI is not enabled'), 501);
      }

      const { aiAssistantId, initialUserMessage } = req.body;

      // express-validator ensures aiAssistantId is a string

      try {

        const isAiAssistantUsable = await openaiService.isAiAssistantUsable(aiAssistantId, req.user);
        if (!isAiAssistantUsable) {
          return res.apiv3Err(new ErrorV3('The specified AI assistant is not usable'), 400);
        }

        const thread = await openaiService.createThread(req.user._id, aiAssistantId, initialUserMessage);

        return res.apiv3(thread);
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    },
  ];
};
