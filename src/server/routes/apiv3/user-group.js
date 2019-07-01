const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:user-group'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const { body, param, query } = require('express-validator/check');

const validator = {};

/**
 * @swagger
 *  tags:
 *    name: UserGroup
 */

module.exports = (crowi) => {
  const { ErrorV3, UserGroup, UserGroupRelation } = crowi.models;
  const { ApiV3FormValidator } = crowi.middlewares;

  const {
    loginRequired,
    adminRequired,
    csrfVerify: csrf,
  } = require('../../util/middlewares')(crowi);

  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/user-groups:
   *      get:
   *        tags: [UserGroup]
   *        description: Gets usergroups
   *        produces:
   *          - application/json
   *        responses:
   *          200:
   *            description: usergroups are fetched
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userGroups:
   *                      type: object
   *                      description: a result of `UserGroup.find`
   */
  router.get('/', loginRequired(), adminRequired, async(req, res) => {
    // TODO: filter with querystring
    try {
      const userGroups = await UserGroup.find();
      return res.apiv3({ userGroups });
    }
    catch (err) {
      const msg = 'Error occurred in fetching user group list';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-list-fetch-failed'));
    }
  });

  validator.create = [
    body('name', 'Group name is required').trim().exists(),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/user-groups:
   *      post:
   *        tags: [UserGroup]
   *        description: Adds userGroup
   *        produces:
   *          - application/json
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  name:
   *                    type: string
   *                    description: name of the userGroup trying to be added
   *        responses:
   *          200:
   *            description: userGroup is added
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userGroup:
   *                      type: object
   *                      description: A result of `UserGroup.createGroupByName`
   */
  router.post('/', loginRequired(), adminRequired, csrf, validator.create, ApiV3FormValidator, async(req, res) => {
    const { name } = req.body;

    try {
      const userGroupName = crowi.xss.process(name);
      const userGroup = await UserGroup.createGroupByName(userGroupName);

      return res.apiv3({ userGroup });
    }
    catch (err) {
      const msg = 'Error occurred in creating a user group';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-create-failed'));
    }
  });

  validator.delete = [
    param('id').trim().exists(),
    query('actionName').trim().exists(),
    query('transferToUserGroupId').trim(),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/user-groups/{:id}:
   *      delete:
   *        tags: [UserGroup]
   *        description: Deletes userGroup
   *        produces:
   *          - application/json
   *        parameters:
   *          - name: deleteGroupId
   *            in: path
   *            description: id of userGroup
   *            schema:
   *              type: ObjectId
   *          - name: actionName
   *            in: query
   *            description: name of action
   *            schema:
   *              type: string
   *          - name: transferToUserGroupId
   *            in: query
   *            description: userGroup id that will be transferred to
   *            schema:
   *              type: ObjectId
   *        responses:
   *          200:
   *            description: userGroup is removed
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userGroups:
   *                      type: object
   *                      description: A result of `UserGroup.removeCompletelyById`
   */
  router.delete('/:id', loginRequired(), adminRequired, csrf, validator.delete, ApiV3FormValidator, async(req, res) => {
    const { id: deleteGroupId } = req.params;
    const { actionName, transferToUserGroupId } = req.query;

    try {
      const userGroup = await UserGroup.removeCompletelyById(deleteGroupId, actionName, transferToUserGroupId);

      return res.apiv3({ userGroup });
    }
    catch (err) {
      const msg = 'Error occurred in deleting a user group';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-delete-failed'));
    }
  });

  // return one group with the id
  // router.get('/:id', async(req, res) => {
  // });

  // update one group with the id
  // router.put('/:id/update', async(req, res) => {
  // });

  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/user-groups/{:id/users}:
   *      get:
   *        tags: [UserGroup]
   *        description: Gets the users related to the userGroup
   *        produces:
   *          - application/json
   *        parameters:
   *          - name: id
   *            in: path
   *            description: id of userGroup
   *            schema:
   *              type: ObjectId
   *        responses:
   *          200:
   *            description: users are fetched
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    users:
   *                      type: array
   *                      items:
   *                        type: object
   *                      description: user objects
   */
  router.get('/:id/users', loginRequired(), adminRequired, async(req, res) => {
    const { id } = req.params;

    try {
      const userGroup = await UserGroup.findById(id);
      const userGroupRelations = await UserGroupRelation.findAllRelationForUserGroup(userGroup);

      const users = userGroupRelations.map((userGroupRelation) => {
        return userGroupRelation.relatedUser;
      });

      return res.apiv3({ users });
    }
    catch (err) {
      const msg = `Error occurred in fetching users for group: ${id}`;
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-fetch-failed'));
    }
  });

  return router;
};
