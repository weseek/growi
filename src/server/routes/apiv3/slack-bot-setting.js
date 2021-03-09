const loggerFactory = require('@alias/logger');

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:routes:apiv3:notification-setting');

const express = require('express');

const router = express.Router();

// const { body } = require('express-validator');

// const ErrorV3 = require('../../models/vo/error-apiv3');

// const validator = {

// };

/**
 * @swagger
 *  slack-bot-setting:
 *    name: SlackBotSetting
 */

module.exports = (crowi) => {
  // const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  // const adminRequired = require('../../middlewares/admin-required')(crowi);
  // const csrf = require('../../middlewares/csrf')(crowi);
  // const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  router.get('/', async(req, res) => {

    const slackBotSettingParams = {
      slackSigningSecret: await crowi.configManager.getConfig('crowi', 'slackbot:signingSecret'),
      slackBotToken: await crowi.configManager.getConfig('crowi', 'slackbot:token'),
    };
    return res.apiv3({ slackBotSettingParams });
  });

  router.put('/', async(req, res) => {

    const slackBotSettingParams = {
      slackSigningSecret: req.body.slackSigningSecret,
      slackBotToken: req.body.slackBotSettingParams,
    };
    return res.apiv3({ slackBotSettingParams });
  });

  return router;
};
