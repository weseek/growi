/* eslint-disable no-use-before-define */
module.exports = (crowi) => {
  const logger = require('@alias/logger')('growi:routes:apiv3:admin:user-group');
  const ApiResponse = require('../../../util/apiResponse');

  const { UserGroup } = crowi.models;

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

      return res.json(ApiResponse.success({ userGroup: newUserGroup }));
    }
    catch (err) {
      logger.error('Error', err);
      return res.json(ApiResponse.error('Error occurred in creating a user group'));
    }
  };

  // api.update = async(req, res) => {
  // };

  api.delete = async(req, res) => {
  };

  return api;
};
