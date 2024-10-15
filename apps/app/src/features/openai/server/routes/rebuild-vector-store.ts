import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';

import type Crowi from '~/server/crowi';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { getOpenaiService } from '../services/openai';

import { certifyAiService } from './middlewares/certify-ai-service';

const logger = loggerFactory('growi:routes:apiv3:openai:rebuild-vector-store');

type RebuildVectorStoreFactory = (crowi: Crowi) => RequestHandler[];

export const rebuildVectorStoreHandlersFactory: RebuildVectorStoreFactory = (crowi) => {
  const accessTokenParser = require('~/server/middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);
  const adminRequired = require('~/server/middlewares/admin-required')(crowi);

  const validator: ValidationChain[] = [
    //
  ];

  return [
    accessTokenParser, loginRequiredStrictly, adminRequired, certifyAiService, validator, apiV3FormValidator,
    async(req: Request, res: ApiV3Response) => {

      try {
        const openaiService = getOpenaiService();
        await openaiService?.rebuildVectorStoreAll();
        return res.apiv3({});

      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('Vector Store rebuild failed'));
      }
    },
  ];
};
