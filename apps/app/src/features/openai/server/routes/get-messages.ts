import { type IUserHasId } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import { type ValidationChain, body } from 'express-validator';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:get-message');

type GetMessagesFactory = (crowi: Crowi) => RequestHandler[];

type ReqBody = {
  threadId: string,
  aiAssistantId: string,
}

type Req = Request<undefined, Response, ReqBody> & {
  user: IUserHasId,
}

export const getMessagesFactory: GetMessagesFactory = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    body('threadId').isString().withMessage('threadId must be string'),
    body('aiAssistantId').isMongoId().withMessage('aiAssistantId must be string'),
  ];

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {
      const openaiService = getOpenaiService();
      if (openaiService == null) {
        return res.apiv3Err(new ErrorV3('GROWI AI is not enabled'), 501);
      }

      try {
        const { aiAssistantId } = req.body;

        const isAiAssistantUsable = openaiService.isAiAssistantUsable(aiAssistantId, req.user);
        if (!isAiAssistantUsable) {
          return res.apiv3Err(new ErrorV3('The specified AI assistant is not usable'), 400);
        }

        // TODO: Implement getMessages

        return res.apiv3({});
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('Failed to get threads'));
      }
    },
  ];
};
