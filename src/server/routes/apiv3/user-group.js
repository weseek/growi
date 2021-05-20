import loggerFactory from '~/utils/logger';

import UserGroup from '~/server/models/user-group';
import UserGroupRelation from '~/server/models/user-group-relation';

const logger = loggerFactory('growi:routes:apiv3:user-group'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const { body, param, query } = require('express-validator');

const mongoose = require('mongoose');

const ErrorV3 = require('../../models/vo/error-apiv3');

const { serializeUserSecurely } = require('../../models/serializers/user-serializer');
const { toPagingLimit, toPagingOffset } = require('../../util/express-validator/sanitizer');

const validator = {};

const { ObjectId } = mongoose.Types;

/**
 * @swagger
 *  tags:
 *    name: UserGroup
 */

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const { User, Page } = crowi.models;

  /**
   * @swagger
   *
   *  paths:
   *    /user-groups:
   *      get:
   *        tags: [UserGroup]
   *        operationId: getUserGroup
   *        summary: /user-groups
   *        description: Get usergroups
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
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {
    const { query } = req;

    // TODO: filter with querystring
    try {
      const page = query.page != null ? parseInt(query.page) : undefined;
      const limit = query.limit != null ? parseInt(query.limit) : undefined;
      const offset = query.offset != null ? parseInt(query.offset) : undefined;
      const pagination = query.pagination != null ? query.pagination !== 'false' : undefined;

      const result = await UserGroup.findUserGroupsWithPagination({
        page, limit, offset, pagination,
      });
      const { docs: userGroups, totalDocs: totalUserGroups, limit: pagingLimit } = result;
      return res.apiv3({ userGroups, totalUserGroups, pagingLimit });
    }
    catch (err) {
      const msg = 'Error occurred in fetching user group list';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-list-fetch-failed'));
    }
  });

  validator.create = [
    body('name', 'Group name is required').trim().exists({ checkFalsy: true }),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /user-groups:
   *      post:
   *        tags: [UserGroup]
   *        operationId: createUserGroup
   *        summary: /user-groups
   *        description: Adds userGroup
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
  router.post('/', loginRequiredStrictly, adminRequired, validator.create, apiV3FormValidator, async(req, res) => {
    const { name } = req.body;

    try {
      const userGroupName = crowi.xss.process(name);
      const userGroup = await UserGroup.createGroupByName(userGroupName);

      return res.apiv3({ userGroup }, 201);
    }
    catch (err) {
      const msg = 'Error occurred in creating a user group';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-create-failed'));
    }
  });

  validator.delete = [
    param('id').isMongoId(),
    query('actionName').isString(),
    query('transferToUserGroupId').if(value => value != null).isMongoId(),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /user-groups/{id}:
   *      delete:
   *        tags: [UserGroup]
   *        operationId: deleteUserGroup
   *        summary: /user-groups/{id}
   *        description: Deletes userGroup
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of userGroup
   *            schema:
   *              type: string
   *          - name: actionName
   *            in: query
   *            description: name of action
   *            schema:
   *              type: string
   *          - name: transferToUserGroupId
   *            in: query
   *            description: userGroup id that will be transferred to
   *            schema:
   *              type: string
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
  router.delete('/:id', loginRequiredStrictly, adminRequired, validator.delete, apiV3FormValidator, async(req, res) => {
    const { id: deleteGroupId } = req.params;
    const { actionName, transferToUserGroupId } = req.query;

    try {
      const userGroup = await crowi.userGroupService.removeCompletelyById(deleteGroupId, actionName, transferToUserGroupId, req.user);

      return res.apiv3({ userGroup });
    }
    catch (err) {
      const msg = 'Error occurred in deleting a user group';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-delete-failed'));
    }
  });

  validator.update = [
    body('name', 'Group name is required').trim().exists({ checkFalsy: true }),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /user-groups/{id}:
   *      put:
   *        tags: [UserGroup]
   *        operationId: updateUserGroups
   *        summary: /user-groups/{id}
   *        description: Update userGroup
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of userGroup
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: userGroup is updated
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userGroup:
   *                      type: object
   *                      description: A result of `UserGroup.updateName`
   */
  router.put('/:id', loginRequiredStrictly, adminRequired, validator.update, apiV3FormValidator, async(req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
      const userGroup = await UserGroup.findById(id);
      if (userGroup == null) {
        throw new Error('The group does not exist');
      }

      // check if the new group name is available
      const isRegisterableName = await UserGroup.isRegisterableName(name);
      if (!isRegisterableName) {
        throw new Error('The group name is already taken');
      }

      await userGroup.updateName(name);

      res.apiv3({ userGroup });
    }
    catch (err) {
      const msg = 'Error occurred in updating a user group name';
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-update-failed'));
    }
  });

  validator.users = {};

  /**
   * @swagger
   *
   *  paths:
   *    /user-groups/{id}/users:
   *      get:
   *        tags: [UserGroup]
   *        operationId: getUsersUserGroups
   *        summary: /user-groups/{id}/users
   *        description: Get users related to the userGroup
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of userGroup
   *            schema:
   *              type: string
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
  router.get('/:id/users', loginRequiredStrictly, adminRequired, async(req, res) => {
    const { id } = req.params;

    try {
      const userGroup = await UserGroup.findById(id);
      const userGroupRelations = await UserGroupRelation.findAllRelationForUserGroup(userGroup);

      const serializeUsers = userGroupRelations.map((userGroupRelation) => {
        return serializeUserSecurely(userGroupRelation.relatedUser);
      });
      const users = serializeUsers.filter(user => user != null);

      return res.apiv3({ users });
    }
    catch (err) {
      const msg = `Error occurred in fetching users for group: ${id}`;
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-user-list-fetch-failed'));
    }
  });

  /**
   * @swagger
   *
   *  paths:
   *    /user-groups/{id}/unrelated-users:
   *      get:
   *        tags: [UserGroup]
   *        operationId: getUnrelatedUsersUserGroups
   *        summary: /user-groups/{id}/unrelated-users
   *        description: Get users unrelated to the userGroup
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of userGroup
   *            schema:
   *              type: string
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
  router.get('/:id/unrelated-users', loginRequiredStrictly, adminRequired, async(req, res) => {
    const { id } = req.params;
    const {
      searchWord, searchType, isAlsoNameSearched, isAlsoMailSearched,
    } = req.query;

    const queryOptions = {
      searchWord, searchType, isAlsoNameSearched, isAlsoMailSearched,
    };

    try {
      const userGroup = await UserGroup.findById(id);
      const users = await UserGroupRelation.findUserByNotRelatedGroup(userGroup, queryOptions);

      // return email only this api
      const serializedUsers = users.map((user) => {
        const { email } = user;
        const serializedUser = serializeUserSecurely(user);
        serializedUser.email = email;
        return serializedUser;
      });
      return res.apiv3({ users: serializedUsers });
    }
    catch (err) {
      const msg = `Error occurred in fetching unrelated users for group: ${id}`;
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-unrelated-user-list-fetch-failed'));
    }
  });

  validator.users.post = [
    param('id').trim().exists({ checkFalsy: true }),
    param('username').trim().exists({ checkFalsy: true }),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /user-groups/{id}/users:
   *      post:
   *        tags: [UserGroup]
   *        operationId: addUserUserGroups
   *        summary: /user-groups/{id}/users
   *        description: Add a user to the userGroup
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of userGroup
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: a user is added
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    user:
   *                      type: object
   *                      description: the user added to the group
   *                    userGroup:
   *                      type: object
   *                      description: the group to which a user was added
   *                    userGroupRelation:
   *                      type: object
   *                      description: the associative entity between user and userGroup
   */
  router.post('/:id/users/:username', loginRequiredStrictly, adminRequired, validator.users.post, apiV3FormValidator, async(req, res) => {
    const { id, username } = req.params;

    try {
      const [userGroup, user] = await Promise.all([
        UserGroup.findById(id),
        User.findUserByUsername(username),
      ]);

      // check for duplicate users in groups
      const isRelatedUserForGroup = await UserGroupRelation.isRelatedUserForGroup(userGroup, user);

      if (isRelatedUserForGroup) {
        logger.warn('The user is already joined');
        return res.apiv3();
      }

      const userGroupRelation = await UserGroupRelation.createRelation(userGroup, user);
      const serializedUser = serializeUserSecurely(user);

      return res.apiv3({ user: serializedUser, userGroup, userGroupRelation });
    }
    catch (err) {
      const msg = `Error occurred in adding the user "${username}" to group "${id}"`;
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-add-user-failed'));
    }
  });

  validator.users.delete = [
    param('id').trim().exists({ checkFalsy: true }),
    param('username').trim().exists({ checkFalsy: true }),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /user-groups/{id}/users:
   *      delete:
   *        tags: [UserGroup]
   *        operationId: deleteUsersUserGroups
   *        summary: /user-groups/{id}/users
   *        description: remove a user from the userGroup
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of userGroup
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: a user was removed
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    user:
   *                      type: object
   *                      description: the user removed from the group
   *                    userGroup:
   *                      type: object
   *                      description: the group from which a user was removed
   *                    userGroupRelation:
   *                      type: object
   *                      description: the associative entity between user and userGroup
   */
  router.delete('/:id/users/:username', loginRequiredStrictly, adminRequired, validator.users.delete, apiV3FormValidator, async(req, res) => {
    const { id, username } = req.params;

    try {
      const [userGroup, user] = await Promise.all([
        UserGroup.findById(id),
        User.findUserByUsername(username),
      ]);

      const userGroupRelation = await UserGroupRelation.findOneAndDelete({ relatedUser: new ObjectId(user._id), relatedGroup: new ObjectId(userGroup._id) });
      const serializedUser = serializeUserSecurely(user);

      return res.apiv3({ user: serializedUser, userGroup, userGroupRelation });
    }
    catch (err) {
      const msg = `Error occurred in removing the user "${username}" from group "${id}"`;
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-remove-user-failed'));
    }
  });

  validator.userGroupRelations = {};

  /**
   * @swagger
   *
   *  paths:
   *    /user-groups/{id}/user-group-relations:
   *      get:
   *        tags: [UserGroup]
   *        operationId: getUserGroupRelationsUserGroups
   *        summary: /user-groups/{id}/user-group-relations
   *        description: Get the user group relations for the userGroup
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of userGroup
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: user group relations are fetched
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userGroupRelations:
   *                      type: array
   *                      items:
   *                        type: object
   *                      description: userGroupRelation objects
   */
  router.get('/:id/user-group-relations', loginRequiredStrictly, adminRequired, async(req, res) => {
    const { id } = req.params;

    try {
      const userGroup = await UserGroup.findById(id);
      const userGroupRelations = await UserGroupRelation.findAllRelationForUserGroup(userGroup);

      return res.apiv3({ userGroupRelations });
    }
    catch (err) {
      const msg = `Error occurred in fetching user group relations for group: ${id}`;
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-user-group-relation-list-fetch-failed'));
    }
  });

  validator.pages = {};

  validator.pages.get = [
    param('id').trim().exists({ checkFalsy: true }),
    query('limit').customSanitizer(toPagingLimit),
    query('offset').customSanitizer(toPagingOffset),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /user-groups/{id}/pages:
   *      get:
   *        tags: [UserGroup]
   *        operationId: getPagesUserGroups
   *        summary: /user-groups/{id}/pages
   *        description: Get closed pages for the userGroup
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: id of userGroup
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: pages are fetched
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    pages:
   *                      type: array
   *                      items:
   *                        type: object
   *                      description: page objects
   */
  router.get('/:id/pages', loginRequiredStrictly, adminRequired, validator.pages.get, apiV3FormValidator, async(req, res) => {
    const { id } = req.params;
    const { limit, offset } = req.query;

    try {
      const { docs, totalDocs } = await Page.paginate({
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: { $in: [id] },
      }, {
        offset,
        limit,
        populate: 'lastUpdateUser',
      });

      const current = offset / limit + 1;

      const pages = docs.map((doc) => {
        doc.lastUpdateUser = serializeUserSecurely(doc.lastUpdateUser);
        return doc;
      });

      // TODO: create a common moudule for paginated response
      return res.apiv3({ total: totalDocs, current, pages });
    }
    catch (err) {
      const msg = `Error occurred in fetching pages for group: ${id}`;
      logger.error(msg, err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-page-list-fetch-failed'));
    }
  });

  return router;
};
