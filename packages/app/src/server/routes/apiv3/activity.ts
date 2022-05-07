import express, { Request, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from 'express-validator';

import { IActivity } from '~/interfaces/activity';
import Activity from '~/server/models/activity';
import loggerFactory from '~/utils/logger';

import Crowi from '../../crowi';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';
import { serializeUserSecurely } from '../../models/serializers/user-serializer';

import { ApiV3Response } from './interfaces/apiv3-response';


const logger = loggerFactory('growi:routes:apiv3:activity');


const validator = {
  list: [
    query('limit').optional().isInt({ max: 100 }).withMessage('limit must be a number less than or equal to 100'),
    query('offset').optional().isInt().withMessage('page must be a number'),
    query('query').optional().isString().withMessage('query must be a string'),
  ],
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message:
    'Too many requests sent from this IP, please try again after 15 minutes.',
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
    const query = req.query.query as string || '';

    try {
      const paginationResult = await Activity.getPaginatedActivity(limit, offset, JSON.parse(query));

      const User = crowi.model('User');
      const serializedDocs = paginationResult.docs.map((doc: IActivity) => {
        if (doc.user != null && doc.user instanceof User) {
          doc.user = serializeUserSecurely(doc.user);
        }
        return doc;
      });

      const serializedPaginationResult = {
        ...paginationResult,
        docs: serializedDocs,
      };

      return res.apiv3({ serializedPaginationResult });
    }
    catch (err) {
      logger.error('Failed to get paginated activity', err);
      return res.apiv3Err(err);
    }
  });

  return router;
};
