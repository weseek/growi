const loggerFactory = require('@alias/logger');

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:routes:apiv3:notification-setting');

const express = require('express');
const apiv3FormValidator = require('../../middlewares/apiv3-form-validator');

const router = express.Router();

// const { body } = require('express-validator');

// const ErrorV3 = require('../../models/vo/error-apiv3');

// const validator = {

// };

/**
 * @swagger
 *  tags:
 *    name: SlackBot
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);

  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  // const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  /**
   * @swagger
   *
   *  paths:
   *    /custom-bot-setting/:
   *      get:
   *        tags:
   *        description: get SingingSecret and slackBotToken
   *        parameters:
   *        responses:
   *          200:
   *            description: Succeeded to get SigningSecret and SlackBotToken
   */
  router.get('/custom-bot-setting', accessTokenParser, loginRequiredStrictly, adminRequired, async(req, res) => {

    const slackBotSettingParams = {
      slackSigningSecret: await crowi.configManager.getConfig('crowi', 'slackbot:signingSecret'),
      slackBotToken: await crowi.configManager.getConfig('crowi', 'slackbot:token'),
    };
    return res.apiv3({ slackBotSettingParams });
  });

  router.put('/custom-bot-setting', accessTokenParser, loginRequiredStrictly, adminRequired, csrf, async(req, res) => {

    const slackBotSettingParams = {
      // temp data
      slackSigningSecret: 1234567890,
      slackBotToken: 'asdfghjkkl1234567890',
    };
    return res.apiv3({ slackBotSettingParams });
  });

  return router;
};
