import { isPopulated } from '@growi/core';

import ExternalUserGroupRelation from '~/features/external-user-group/server/models/external-user-group-relation';

import UserGroupRelation from '../models/user-group-relation';

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      UserGroup:
 *        description: UserGroup
 *        type: object
 *        properties:
 *          __v:
 *            type: number
 *            description: record version
 *            example: 0
 *          _id:
 *            type: string
 *            description: user group ID
 *            example: 5e2d56c1e35da4004ef7e0b0
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      UserGroupRelation:
 *        description: UserGroupRelation
 *        type: object
 *        properties:
 *          __v:
 *            type: number
 *            description: record version
 *            example: 0
 *          _id:
 *            type: string
 *            description: user group relation ID
 *            example: 5e2d56cbe35da4004ef7e0b1
 *          relatedGroup:
 *            $ref: '#/components/schemas/UserGroup'
 *          relatedUser:
 *            $ref: '#/components/schemas/User/properties/_id'
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 */

module.exports = function(crowi, app) {
  const ApiResponse = require('../util/apiResponse');

  // , pluginService = require('../service/plugin')

  const actions = {};

  const api = {};
  actions.api = api;

  /**
   * retrieve user-group documents
   * @param {object} req
   * @param {object} res
   */
  api.userGroups = function(req, res) {
    UserGroupRelation.findAllRelationForUser(req.user)
      .then((userGroupRelations) => {
        const userGroups = userGroupRelations.map((relation) => {
          // relation.relatedGroup should be populated
          return isPopulated(relation.relatedGroup) ? relation.relatedGroup : undefined;
        })
          // exclude undefined elements
          .filter(elem => elem != null);
        return res.json(ApiResponse.success({ userGroups }));
      });
  };

  /**
   * retrieve external-user-group-relation documents
   * @param {object} req
   * @param {object} res
   */
  api.externalUserGroups = function(req, res) {
    ExternalUserGroupRelation.findAllRelationForUser(req.user)
      .then((userGroupRelations) => {
        const userGroups = userGroupRelations.map((relation) => {
          // relation.relatedGroup should be populated
          return isPopulated(relation.relatedGroup) ? relation.relatedGroup : undefined;
        })
          // exclude undefined elements
          .filter(elem => elem != null);
        return res.json(ApiResponse.success({ userGroups }));
      });
  };

  return actions;
};
