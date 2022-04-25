import express, { Request, Router } from 'express';

import Crowi from '../../crowi';

import { ApiV3Response } from './interfaces/apiv3-response';


interface AuthorizedRequest extends Request {
 user?: any
}

module.exports = (crowi: Crowi): Router => {
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  const router = express.Router();

  router.get('/list', accessTokenParser, loginRequiredStrictly, adminRequired, async(req: AuthorizedRequest, res: ApiV3Response) => {
    return res.apiv3({});
  });

  return router;
};
