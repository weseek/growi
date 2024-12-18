import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:create-assistant');

type CreateAssistantFactory = (crowi: Crowi) => RequestHandler[];

export const createAssistantFactory: CreateAssistantFactory = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);
  const adminRequired = require('~/server/middlewares/admin-required')(crowi);

  const validator: ValidationChain[] = [
    //
  ];

  return [
    accessTokenParser, loginRequiredStrictly, adminRequired, certifyAiService, validator, apiV3FormValidator,
    async(req: Request, res: ApiV3Response) => {

      try {
        return res.apiv3({});

      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('AiAssistant creation failed'));
      }
    },
  ];
};
