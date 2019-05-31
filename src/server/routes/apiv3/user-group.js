const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:user-group'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const { body, param } = require('express-validator/check');

const validator = {};

const {
  accessTokenParser,
  csrfVerify,
  loginRequired,
  adminRequired,
  formValid,
} = require('../../util/middlewares');

const ApiResponse = require('../../util/apiResponse');

module.exports = (crowi) => {
  const { UserGroup, UserGroupRelation } = crowi.models;

  router.use('/', accessTokenParser(crowi));

  router.get('/', loginRequired(crowi), adminRequired(), async(req, res) => {
    // TODO: filter with querystring
    try {
      const userGroups = await UserGroup.find();
      return res.json(ApiResponse.success({ userGroups }));
    }
    catch (err) {
      logger.error('Error', err);
      return res.json(ApiResponse.error('Error occurred in fetching user groups'));
    }
  });

  validator.create = [
    body('name').trim().exists(),
  ];

  router.post('/create', loginRequired(crowi), adminRequired(), csrfVerify(crowi), validator.create, formValid(), async(req, res) => {
    const { name } = req.body;

    try {
      const userGroupName = crowi.xss.process(name);
      const userGroup = await UserGroup.createGroupByName(userGroupName);

      return res.json(ApiResponse.success({ userGroup }));
    }
    catch (err) {
      const msg = 'Error occurred in creating a user group';
      logger.error(msg, err);
      return res.json(ApiResponse.error(msg));
    }
  });

  validator.delete = [
    param('id').trim().exists(),
    body('actionName').trim().exists(),
    body('transferToUserGroupId').trim(),
  ];

  router.post('/:id/delete', loginRequired(crowi), adminRequired(), csrfVerify(crowi), validator.delete, formValid(), async(req, res) => {
    const { id: deleteGroupId } = req.params;
    const { actionName, transferToUserGroupId } = req.body;

    try {
      const userGroup = await UserGroup.removeCompletelyById(deleteGroupId, actionName, transferToUserGroupId);

      return res.json(ApiResponse.success({ userGroup }));
    }
    catch (err) {
      const msg = 'Error occurred in deleting a user group';
      logger.error(msg, err);
      return res.json(ApiResponse.error(msg));
    }
  });

  // return one group with the id
  // router.get('/:id', async(req, res) => {
  // });

  // update one group with the id
  // router.post('/:id/update', async(req, res) => {
  // });

  router.get('/:id/users', loginRequired(crowi), adminRequired(), async(req, res) => {
    const { id } = req.params;

    try {
      const userGroup = await UserGroup.findById(id);
      const userGroupRelations = await UserGroupRelation.findAllRelationForUserGroup(userGroup);

      const users = userGroupRelations.map((userGroupRelation) => {
        return userGroupRelation.relatedUser;
      });

      return res.json(ApiResponse.success({ users }));
    }
    catch (err) {
      const msg = `Error occurred in fetching users for group: ${id}`;
      logger.error(msg, err);
      return res.json(ApiResponse.error(msg));
    }
  });

  return router;
};
