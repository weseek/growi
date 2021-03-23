const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:notification-setting');
const express = require('express');
const crypto = require('crypto');
const ErrorV3 = require('../../models/vo/error-apiv3');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: SlackIntegration
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      CustomBot:
 *        description: CustomBot
 *        type: object
 *        properties:
 *          slackSigningSecret:
 *            type: string
 *          slackBotToken:
 *            type: string
 *          botType:
 *            type: string
 */


module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);

  async function updateSlackBotSettings(params) {
    const { configManager } = crowi;
    // update config without publishing S2sMessage
    return configManager.updateConfigsInTheSameNamespace('crowi', params, true);
  }

  function generateAccessToken() {
    const hasher = crypto.createHash('sha256');
    hasher.update(`${new Date().getTime()}`);

    return hasher.digest('base64');
  }


  /**
   * @swagger
   *
   *    /slack-integration/access-token:
   *      put:
   *        tags: [SlackIntegration]
   *        operationId: getCustomBotSetting
   *        summary: /slack-integration
   *        description: Generate accessToken
   *        responses:
   *          200:
   *            description: Succeeded to get SigningSecret, SlackBotToken and BotType.
   */
  router.put('/access-token', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {

    try {
      const accessToken = generateAccessToken();
      await updateSlackBotSettings({ 'slackbot:access-token': accessToken });

      return res.apiv3({ accessToken });
    }
    catch (error) {
      const msg = 'Error occured in updating Custom bot setting';
      logger.error('Error', error);
      return res.apiv3Err(new ErrorV3(msg, 'update-CustomBotSetting-failed'));
    }
  });

  return router;
};
