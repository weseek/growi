import loggerFactory from '~/utils/logger';

import UserGroupRelation from '~/server/models/user-group-relation';

const logger = loggerFactory('growi:routes:apiv3:user-group-relation'); // eslint-disable-line no-unused-vars

const express = require('express');

const ErrorV3 = require('../../models/vo/error-apiv3');
const { serializeUserGroupRelationSecurely } = require('../../models/serializers/user-group-relation-serializer');

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
    try {
      const relations = await UserGroupRelation.find().populate('relatedUser');

      const serialized = relations.map(relation => serializeUserGroupRelationSecurely(relation));

      return res.apiv3({ userGroupRelations: serialized });
    }
    catch (err) {
      const msg = 'Error occurred in fetching user group relations';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-relation-list-fetch-failed'));
    }
  });

  return router;
};
