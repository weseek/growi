import express, {
  NextFunction, Request, RequestHandler, Response, Router,
} from 'express';
import Crowi from '../../crowi';


const getPagesAroundTarget = (req: Request, res: Response): any => {
  return res.send('OK');
};

export default (crowi: Crowi): Router => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  // Do not use loginRequired with isGuestAllowed true since page tree may show private pages' title
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  return express.Router()
    .get('/pages', accessTokenParser, loginRequiredStrictly, getPagesAroundTarget);
};
