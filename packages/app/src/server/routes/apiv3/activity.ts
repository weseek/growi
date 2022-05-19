import { parse, addMinutes, isValid } from 'date-fns';
import escapeStringRegexp from 'escape-string-regexp';
import express, { Request, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from 'express-validator';

import { AllSupportedActionType } from '~/interfaces/activity';
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
    query('searchFilter').optional().isString().withMessage('query must be a string'),
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

  const User = crowi.model('User');

  const router = express.Router();

  // eslint-disable-next-line max-len
  router.get('/', apiLimiter, accessTokenParser, loginRequiredStrictly, adminRequired, validator.list, apiV3FormValidator, async(req: Request, res: ApiV3Response) => {
    const limit = req.query.limit || await crowi.configManager?.getConfig('crowi', 'customize:showPageLimitationS') || 10;
    const offset = req.query.offset || 1;

    const query = {};

    try {
      const parsedSearchFilter = JSON.parse(req.query.searchFilter as string);

      // add username to query
      if (typeof parsedSearchFilter.username === 'string') {
        Object.assign(query, { 'snapshot.username': parsedSearchFilter.username });
      }

      // add action to query
      const canContainActionFilterToQuery = parsedSearchFilter.action.every(a => AllSupportedActionType.includes(a));
      if (canContainActionFilterToQuery) {
        Object.assign(query, { action: parsedSearchFilter.action });
      }

      // add date to query
      const startDate = parse(parsedSearchFilter.date.startDate, 'yyyy/MM/dd', new Date());
      const endDate = parse(parsedSearchFilter.date.endDate, 'yyyy/MM/dd', new Date());
      if (isValid(startDate) && isValid(endDate)) {
        Object.assign(query, {
          createdAt: {
            $gte: startDate,
            // + 23 hours 59 minutes
            $lt: addMinutes(endDate, 1439),
          },
        });
      }
      else if (isValid(startDate) && !isValid(endDate)) {
        Object.assign(query, {
          createdAt: {
            $gte: startDate,
            // + 23 hours 59 minutes
            $lt: addMinutes(startDate, 1439),
          },
        });
      }
    }
    catch (err) {
      logger.error('Invalid value', err);
      return res.apiv3Err(err, 400);
    }

    try {
      const paginationResult = await Activity.getPaginatedActivity(limit, offset, query);
      return res.apiv3({ paginationResult });
    }
    catch (err) {
      logger.error('Failed to get paginated activity', err);
      return res.apiv3Err(err, 500);
    }
  });

  router.get('/usernames', loginRequiredStrictly, adminRequired, async(req: Request, res: ApiV3Response) => {
    const q = req.query.q as string;
    const escapedString = escapeStringRegexp(q);

    try {
      const undeletedUsernames = await User.find({
        status: { $ne: User.STATUS_DELETED },
        username: new RegExp(`^${escapedString}`, 'i'),
      }).distinct('username');

      const activitySnapshotUsernames = await Activity.find({
        $and: [
          { 'snapshot.username': { $nin: undeletedUsernames } },
          { 'snapshot.username': new RegExp(`^${escapedString}`, 'i') },
        ],
      }).distinct('snapshot.username');

      return res.apiv3({ usernames: [...undeletedUsernames, ...activitySnapshotUsernames] });
    }
    catch (err) {
      logger.error('failed to get usernames', err);
      return res.apiv3Err(err);
    }
  });

  return router;
};
