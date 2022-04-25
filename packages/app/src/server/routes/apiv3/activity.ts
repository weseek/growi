import express, { Request, Router } from 'express';

import Crowi from '../../crowi';

import { ApiV3Response } from './interfaces/apiv3-response';


interface AuthorizedRequest extends Request {
 user?: any
}

module.exports = (crowi: Crowi): Router => {
  const router = express.Router();

  router.get('/list', async(req: AuthorizedRequest, res: ApiV3Response) => {
    return res.apiv3({});
  });

  return router;
};
