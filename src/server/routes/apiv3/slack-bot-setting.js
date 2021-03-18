const loggerFactory = require('@alias/logger');

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:routes:apiv3:notification-setting');

const express = require('express');
const apiv3FormValidator = require('../../middlewares/apiv3-form-validator');
const ErrorV3 = require('../../models/vo/error-apiv3');

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

  async function updateCustomBotSettings(params) {
    const { configManager } = crowi;

    // update config without publishing S2sMessage
    return configManager.updateConfigsInTheSameNamespace('crowi', params, true);
  }


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

    const requestParams = {
      // temp data
      'slackbot:signingSecret': 1234567890,
      'slackbot:token': 'asdfghjkkl1234567890',
    };

    try {
      await updateCustomBotSettings(requestParams);
      const slackBotSettingParams = {
        slackSigningSecret: await crowi.configManager.getConfig('crowi', 'slackbot:signingSecret'),
        slackBotToken: await crowi.configManager.getConfig('crowi', 'slackbot:token'),
      };
      return res.apiv3({ slackBotSettingParams });
    }
    catch (error) {
      const msg = 'Error occured in updating Custom bot setting';
      logger.error('Error', error);
      return res.apiv3Err(new ErrorV3(msg, 'update-Custom bot-failed'));
    }
  });

  return router;
};
