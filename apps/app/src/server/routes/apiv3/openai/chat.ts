import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';

import type Crowi from '~/server/crowi';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import type { ApiV3Response } from '../interfaces/apiv3-response';


const logger = loggerFactory('growi:routes:apiv3:openai:chat');


type ReqParams = {
  //
}

type Req = Request<ReqParams, ApiV3Response>

type ChatHandlersFactory = (crowi: Crowi) => RequestHandler[];

export const chatHandlersFactory: ChatHandlersFactory = (crowi) => {
  const accessTokenParser = require('../../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../../middlewares/login-required')(crowi);

  // define validators for req.body
  const validator: ValidationChain[] = [];

  return [
    accessTokenParser, loginRequiredStrictly, validator, apiV3FormValidator,
    async(req: Req, res: ApiV3Response) => {

      try {
        return res.apiv3({});
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    },
  ];
};
