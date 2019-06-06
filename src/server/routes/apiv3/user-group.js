const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:user-group'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const { body, param, query } = require('express-validator/check');

const {
  csrfVerify,
  loginRequired,
  adminRequired,
} = require('../../util/middlewares');

const validator = {};

module.exports = (crowi) => {
  const { ErrorV3, UserGroup, UserGroupRelation } = crowi.models;
  const { formValid } = require('../../middlewares');

  router.get('/', loginRequired(crowi), adminRequired(), async(req, res) => {
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

  router.post('/', loginRequired(crowi), adminRequired(), csrfVerify(crowi), validator.create, formValid(crowi), async(req, res) => {
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

  router.delete('/:id', loginRequired(crowi), adminRequired(), csrfVerify(crowi), validator.delete, formValid(crowi), async(req, res) => {
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

  router.get('/:id/users', loginRequired(crowi), adminRequired(), async(req, res) => {
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
