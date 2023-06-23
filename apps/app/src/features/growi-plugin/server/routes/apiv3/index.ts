import express, { Request, Router } from 'express';

import Crowi from '~/server/crowi';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';

import { GrowiPlugin } from '../../models';


module.exports = (crowi: Crowi): Router => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const router = express.Router();

  router.get('/', loginRequiredStrictly, async(req: Request, res: ApiV3Response) => {
    try {
      const data = await GrowiPlugin.find({});
      return res.apiv3({ plugins: data });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  return router;
};
