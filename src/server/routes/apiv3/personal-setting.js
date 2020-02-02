/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:personal-setting');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');
const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: PsersonalSetting
 */
module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);
  const { customizeService } = crowi;

  const { User } = crowi.models;


  const { ApiV3FormValidator } = crowi.middlewares;

  // TODO swagger
  router.get('/', loginRequiredStrictly, async(req, res) => {
    const personalParams = {
      currentUser: await User.findUserByUsername(req.user.username),
      registrationWhiteList: await crowi.configManager.getConfig('crowi', 'security:registrationWhiteList'),
    };
    return res.apiv3(personalParams);
  });

  return router;
};
