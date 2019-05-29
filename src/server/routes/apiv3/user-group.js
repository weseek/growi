/* eslint-disable no-use-before-define */
module.exports = (crowi) => {
  const logger = require('@alias/logger')('growi:routes:apiv3:user-group');
  const ApiResponse = require('../../util/apiResponse');

  const { UserGroup, UserGroupRelation } = crowi.models;

  const api = {};

  api.find = async(req, res) => {
    // TODO: filter with querystring
    try {
      const userGroups = await UserGroup.find();
      return res.json(ApiResponse.success({ userGroups }));
    }
    catch (err) {
      logger.error('Error', err);
      return res.json(ApiResponse.error('Error occurred in fetching user groups'));
    }
  };

  // api.findOne = async(req, res) => {
  // };

  api.create = async(req, res) => {
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
  };

  // api.update = async(req, res) => {
  // };

  api.delete = async(req, res) => {
    const { id: deleteGroupId } = req.params;
    const { actionName, transferToUserGroupId } = req.body;
    try {
      await UserGroup.removeCompletelyById(deleteGroupId, actionName, transferToUserGroupId);

      return res.json(ApiResponse.success());
    }
    catch (err) {
      const msg = 'Error occurred in deleting a user group';
      logger.error(msg, err);
      return res.json(ApiResponse.error(msg));
    }
  };

  return api;
};
