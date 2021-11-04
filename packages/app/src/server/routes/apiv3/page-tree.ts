import express, {
  NextFunction, Request, RequestHandler, Response, Router,
} from 'express';
import Crowi from '../../crowi';
import { ApiV3Response } from './apiv3-response';


const getPagesAroundTarget = (req: Request, res: ApiV3Response): any => {
  return res.apiV3();
};

export default (crowi: Crowi): Router => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  // Do not use loginRequired with isGuestAllowed true since page tree may show private pages' title
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  return express.Router()
    .get('/pages', accessTokenParser, loginRequiredStrictly, getPagesAroundTarget);
};
