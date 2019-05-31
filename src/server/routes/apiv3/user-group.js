const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:user-group'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const middleware = require('../../util/middlewares');

const { loginRequired, adminRequired, formValid } = middleware;

const ApiResponse = require('../../util/apiResponse');

module.exports = (crowi) => {
  const { UserGroup, UserGroupRelation } = crowi.models;

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

  router.post('/create', loginRequired(crowi), adminRequired(), async(req, res) => {
    const { name } = req.body;
    try {
      const userGroupName = crowi.xss.process(name);
      const newUserGroup = await UserGroup.createGroupByName(userGroupName);
      const userGroupRelations = await UserGroupRelation.findAllRelationForUserGroup(newUserGroup);

      const data = {
        userGroup: newUserGroup,
        userGroupRelation: userGroupRelations,
      };

      return res.json(ApiResponse.success(data));
    }
    catch (err) {
      const msg = 'Error occurred in creating a user group';
      logger.error(msg, err);
      return res.json(ApiResponse.error(msg));
    }
  });

  router.post('/:id/delete', loginRequired(crowi), adminRequired(), async(req, res) => {
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
  // router.get('/:id', loginRequired(crowi), adminRequired(), async(req, res) => {
  // });

  // update one group with the id
  // router.post('/:id/update', loginRequired(crowi), adminRequired(), async(req, res) => {
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
      const msg = `Error occurred in fetching user group relations for group: ${id}`;
      logger.error(msg, err);
      return res.json(ApiResponse.error(msg));
    }
  });

  return router;
};
