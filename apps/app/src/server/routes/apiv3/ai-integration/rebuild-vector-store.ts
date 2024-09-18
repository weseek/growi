import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';

import type Crowi from '~/server/crowi';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import type { ApiV3Response } from '../interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:ai-integration:rebuild-vector-store');

type Req = Request<undefined, ApiV3Response>

type RebuildVectorStoreFactory = (crowi: Crowi) => RequestHandler[];

export const rebuildVectorStoreHandlersFactory: RebuildVectorStoreFactory = (crowi) => {
  const accessTokenParser = require('~/server/middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);
  const adminRequired = require('~/server/middlewares/admin-required')(crowi);

  const validator: ValidationChain[] = [
    //
  ];

  return [
    accessTokenParser, loginRequiredStrictly, adminRequired, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {
      return res.apiv3({});
    },
  ];
};
