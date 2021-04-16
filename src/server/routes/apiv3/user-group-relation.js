import loggerFactory from '~/utils/logger';

import UserGroup from '~/server/models/user-group';
import UserGroupRelation from '~/server/models/user-group-relation';

const logger = loggerFactory('growi:routes:apiv3:user-group-relation'); // eslint-disable-line no-unused-vars

const express = require('express');

const { serializeUserSecurely } = require('../../models/serializers/user-serializer');
const ErrorV3 = require('../../models/vo/error-apiv3');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: UserGroupRelation
 */

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);

  /**
   * @swagger
   *  paths:
   *    /user-group-relations:
   *      get:
   *        tags: [UserGroupRelation]
   *        operationId: listUserGroupRelations
   *        summary: /user-group-relations
   *        description: Gets the user group relations
   *        responses:
   *          200:
   *            description: user group relations are fetched
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userGroupRelations:
   *                      type: object
   *                      description: contains arrays user objects related
   */
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {
    // TODO: filter with querystring? or body
    try {
      const page = parseInt(req.query.page) || 1;
      const result = await UserGroup.findUserGroupsWithPagination({ page });
      // const pager = createPager(result.total, result.limit, result.page, result.pages, MAX_PAGE_LIST);
      const userGroups = result.docs;

      const userGroupRelationsObj = {};
      await Promise.all(userGroups.map(async(userGroup) => {
        const userGroupRelations = await UserGroupRelation.findAllRelationForUserGroup(userGroup);
        userGroupRelationsObj[userGroup._id] = userGroupRelations.map((userGroupRelation) => {
          return serializeUserSecurely(userGroupRelation.relatedUser);
        });
      }));

      const data = {
        userGroupRelations: userGroupRelationsObj,
      };

      return res.apiv3(data);
    }
    catch (err) {
      const msg = 'Error occurred in fetching user group relations';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-relation-list-fetch-failed'));
    }
  });

  return router;
};
