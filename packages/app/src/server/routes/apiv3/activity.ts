import express, { Request, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from 'express-validator';

import Activity from '~/server/models/activity';
import loggerFactory from '~/utils/logger';

import Crowi from '../../crowi';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';

import { ApiV3Response } from './interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:activity');


const validator = {
  list: [
    query('limit').optional().isInt({ max: 100 }).withMessage('limit must be a number less than or equal to 100'),
    query('offset').optional().isInt().withMessage('page must be a number'),
  ],
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message:
    'Too many requests were sent from this IP. Please try a password reset request again on the password reset request form',
});

module.exports = (crowi: Crowi): Router => {
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  const router = express.Router();

  // eslint-disable-next-line max-len
  router.get('/', apiLimiter, accessTokenParser, loginRequiredStrictly, adminRequired, validator.list, apiV3FormValidator, async(req: Request, res: ApiV3Response) => {
    const limit = req.query.limit || await crowi.configManager?.getConfig('crowi', 'customize:showPageLimitationS') || 10;
    const offset = req.query.offset || 1;

    try {
      const paginatedActivity = await Activity.getPaginatedActivity(limit, offset);
      return res.apiv3({ paginatedActivity });
    }
    catch (err) {
      logger.error('Failed to get paginated activity', err);
      return res.apiv3Err(err);
    }
  });

  return router;
};
