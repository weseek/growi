import express, { Request, Router } from 'express';

import Crowi from '~/server/crowi';
import { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';

import { CmsNamespace } from '../../models';


/*
 * Validators
 */
const validator = {
};

module.exports = (crowi: Crowi): Router => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const router = express.Router();

  router.get('/', loginRequiredStrictly, async(req: Request, res: ApiV3Response) => {
    try {
      const data = await CmsNamespace.find({});
      return res.apiv3({ data });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  return router;
};
