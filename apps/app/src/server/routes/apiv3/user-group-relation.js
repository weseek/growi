import { ErrorV3 } from '@growi/core/dist/models';

import UserGroupRelation from '~/server/models/user-group-relation';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:user-group-relation'); // eslint-disable-line no-unused-vars

const express = require('express');
const { query } = require('express-validator');

const { serializeUserGroupRelationSecurely } = require('../../models/serializers/user-group-relation-serializer');

const router = express.Router();

const validator = {};

/**
 * @swagger
 *  tags:
 *    name: UserGroupRelation
 */

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);

  validator.list = [
    query('groupIds', 'groupIds is required and must be an array').isArray(),
    query('childGroupIds', 'childGroupIds must be an array').optional().isArray(),
  ];

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
  router.get('/', loginRequiredStrictly, adminRequired, validator.list, async(req, res) => {
    const { query } = req;

    try {
      const relations = await UserGroupRelation.find({ relatedGroup: { $in: query.groupIds } }).populate('relatedUser');

      let relationsOfChildGroups = null;
      if (Array.isArray(query.childGroupIds)) {
        const _relationsOfChildGroups = await UserGroupRelation.find({ relatedGroup: { $in: query.childGroupIds } }).populate('relatedUser');
        relationsOfChildGroups = _relationsOfChildGroups.map(relation => serializeUserGroupRelationSecurely(relation)); // serialize
      }

      const serialized = relations.map(relation => serializeUserGroupRelationSecurely(relation));

      return res.apiv3({ userGroupRelations: serialized, relationsOfChildGroups });
    }
    catch (err) {
      const msg = 'Error occurred in fetching user group relations';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-relation-list-fetch-failed'));
    }
  });

  return router;
};
