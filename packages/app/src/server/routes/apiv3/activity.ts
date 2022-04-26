import express, { Request, Router } from 'express';
import { query } from 'express-validator';

import Crowi from '../../crowi';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';

import { ApiV3Response } from './interfaces/apiv3-response';


const validator = {
  list: [
    query('limit').optional().isInt({ max: 100 }).withMessage('limit must be a number less than or equal to 100'),
    query('offset').optional().isInt().withMessage('page must be a number'),

  ],
};

module.exports = (crowi: Crowi): Router => {
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  const router = express.Router();

  const activityService = crowi.activityService;


  router.get(
    '/list', accessTokenParser, loginRequiredStrictly, adminRequired, validator.list, apiV3FormValidator, async(req: Request, res: ApiV3Response) => {
      const limit = req.query.limit || await crowi.configManager?.getConfig('crowi', 'customize:showPageLimitationS') || 10;
      const offset = req.query.offset || 1;

      try {
        const paginatedActivity = await activityService.getPaginatedActivity(limit, offset);
        return res.apiv3({ paginatedActivity });
      }
      catch (err) {
        return res.apiv3Err(err);
      }
    },
  );

  return router;
};
