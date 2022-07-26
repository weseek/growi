import { parseISO, addMinutes, isValid } from 'date-fns';
import express, { Request, Router } from 'express';
import { query } from 'express-validator';

import { IActivity, ISearchFilter } from '~/interfaces/activity';
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
    query('searchFilter').optional().isString().withMessage('query must be a string'),
  ],
};

module.exports = (crowi: Crowi): Router => {
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  const router = express.Router();

  // eslint-disable-next-line max-len
  router.get('/', accessTokenParser, loginRequiredStrictly, adminRequired, validator.list, apiV3FormValidator, async(req: Request, res: ApiV3Response) => {
    const auditLogEnabled = crowi.configManager?.getConfig('crowi', 'app:auditLogEnabled') || false;
    if (!auditLogEnabled) {
      const msg = 'AuditLog is not enabled';
      logger.error(msg);
      return res.apiv3Err(msg, 405);
    }

    const limit = req.query.limit || await crowi.configManager?.getConfig('crowi', 'customize:showPageLimitationS') || 10;
    const offset = req.query.offset || 1;

    const query = {};

    try {
      const parsedSearchFilter = JSON.parse(req.query.searchFilter as string) as ISearchFilter;

      // add username to query
      const canContainUsernameFilterToQuery = (
        parsedSearchFilter.usernames != null
        && parsedSearchFilter.usernames.length > 0
        && parsedSearchFilter.usernames.every(u => typeof u === 'string')
      );
      if (canContainUsernameFilterToQuery) {
        Object.assign(query, { 'snapshot.username': parsedSearchFilter.usernames });
      }

      // add action to query
      if (parsedSearchFilter.actions != null) {
        const availableActions = crowi.activityService.getAvailableActions(false);
        const searchableActions = parsedSearchFilter.actions.filter(action => availableActions.includes(action));
        Object.assign(query, { action: searchableActions });
      }

      // add date to query
      const startDate = parseISO(parsedSearchFilter?.dates?.startDate || '');
      const endDate = parseISO(parsedSearchFilter?.dates?.endDate || '');
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
      const paginateResult = await Activity.paginate(
        query,
        {
          limit,
          offset,
          sort: { createdAt: -1 },
          populate: 'user',
        },
      );

      const User = crowi.model('User');
      const serializedDocs = paginateResult.docs.map((doc: IActivity) => {
        if (doc.user != null && doc.user instanceof User) {
          doc.user = serializeUserSecurely(doc.user);
        }
        return doc;
      });

      const serializedPaginationResult = {
        ...paginateResult,
        docs: serializedDocs,
      };

      return res.apiv3({ serializedPaginationResult });
    }
    catch (err) {
      logger.error('Failed to get paginated activity', err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;
};
