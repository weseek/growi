import { type IUserHasId } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import { type ValidationChain, param } from 'express-validator';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { type AiAssistantUpdateData } from '../../interfaces/ai-assistant';
import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';
import { upsertAiAssistantValidator } from './middlewares/upsert-ai-assistant-validator';

const logger = loggerFactory('growi:routes:apiv3:openai:update-ai-assistants');

type UpdateAiAssistantsFactory = (crowi: Crowi) => RequestHandler[];

type ReqParams = {
  id: string,
}

type ReqBody = AiAssistantUpdateData;

type Req = Request<ReqParams, Response, ReqBody> & {
  user: IUserHasId,
}

export const updateAiAssistantsFactory: UpdateAiAssistantsFactory = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validator: ValidationChain[] = [
    param('id').isMongoId().withMessage('aiAssistant id is required'),
    ...upsertAiAssistantValidator,
  ];

  return [
    accessTokenParser, loginRequiredStrictly, certifyAiService, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {
      const { id } = req.params;
      const { user } = req;

      try {
        const openaiService = getOpenaiService();
        const updatedAiAssistant = await openaiService?.updateAiAssistant(user._id, id, req.body);

        return res.apiv3({ updatedAiAssistant });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('Failed to update AiAssistants'));
      }
    },
  ];
};
