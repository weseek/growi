import { type IUserHasId } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { type IApiv3AiAssistantCreateParams } from '../../interfaces/ai-assistant';
import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';
import { upsertAiAssistantValidator } from './middlewares/upsert-ai-assistant-validator';

const logger = loggerFactory('growi:routes:apiv3:openai:create-ai-assistant');

type CreateAssistantFactory = (crowi: Crowi) => RequestHandler[];

type Req = Request<undefined, Response, IApiv3AiAssistantCreateParams> & {
  user: IUserHasId,
}

export const createAiAssistantFactory: CreateAssistantFactory = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService, upsertAiAssistantValidator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {
      try {
        const aiAssistantData = { ...req.body, owner: req.user._id };
        const openaiService = getOpenaiService();
        const aiAssistant = await openaiService?.createAiAssistant(aiAssistantData);

        return res.apiv3({ aiAssistant });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('AiAssistant creation failed'));
      }
    },
  ];
};
