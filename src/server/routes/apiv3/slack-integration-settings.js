const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:notification-setting');
const express = require('express');
const { body } = require('express-validator');
const crypto = require('crypto');
const { WebClient, LogLevel } = require('@slack/web-api');
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
 *      CustomBotWithoutProxy:
 *        description: CustomBotWithoutProxy
 *        type: object
 *        properties:
 *          slackSigningSecret:
 *            type: string
 *          slackBotToken:
 *            type: string
 *          currentBotType:
 *            type: string
 *      SlackIntegration:
 *        description: SlackIntegration
 *        type: object
 *        properties:
 *          currentBotType:
 *            type: string
 */


module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const validator = {
    BotType: [
      body('currentBotType').isString(),
    ],
    SlackIntegration: [
      body('currentBotType')
        .isIn(['officialBot', 'customBotWithoutProxy', 'customBotWithProxy']),
    ],
    NotificationTestToSlackWorkSpace: [
      body('channel').trim().not().isEmpty()
        .isString(),
    ],
  };

  async function resetAllBotSettings() {
    const params = {
      'slackbot:currentBotType': '',
      'slackbot:signingSecret': '',
      'slackbot:token': '',
    };
    const { configManager } = crowi;
    // update config without publishing S2sMessage
    return configManager.updateConfigsInTheSameNamespace('crowi', params, true);
  }

  async function updateSlackBotSettings(params) {
    const { configManager } = crowi;
    // update config without publishing S2sMessage
    return configManager.updateConfigsInTheSameNamespace('crowi', params, true);
  }

  function generateAccessToken(user) {
    const hasher = crypto.createHash('sha512');
    hasher.update(new Date().getTime() + user._id);

    return hasher.digest('base64');
  }

  /**
   * @swagger
   *
   *    /slack-integration/:
   *      get:
   *        tags: [SlackBotSettingParams]
   *        operationId: getSlackBotSettingParams
   *        summary: get /slack-integration
   *        description: Get slackBot setting params.
   *        responses:
   *          200:
   *            description: Succeeded to get slackBot setting params.
   */
  router.get('/', accessTokenParser, loginRequiredStrictly, adminRequired, async(req, res) => {
    const slackBotSettingParams = {
      accessToken: crowi.configManager.getConfig('crowi', 'slackbot:access-token'),
      currentBotType: crowi.configManager.getConfig('crowi', 'slackbot:currentBotType'),
      // TODO impl when creating official bot
      officialBotSettings: {
        // TODO impl this after GW-4939
        // AccessToken: "tempaccessdatahogehoge",
      },
      customBotWithoutProxySettings: {
        // TODO impl this after GW-4939
        // AccessToken: "tempaccessdatahogehoge",
        slackSigningSecretEnvVars: crowi.configManager.getConfigFromEnvVars('crowi', 'slackbot:signingSecret'),
        slackBotTokenEnvVars: crowi.configManager.getConfigFromEnvVars('crowi', 'slackbot:token'),
        slackSigningSecret: crowi.configManager.getConfig('crowi', 'slackbot:signingSecret'),
        slackBotToken: crowi.configManager.getConfig('crowi', 'slackbot:token'),
      },
      // TODO imple when creating with proxy
      customBotWithProxySettings: {
        // TODO impl this after GW-4939
        // AccessToken: "tempaccessdatahogehoge",
      },
    };
    return res.apiv3({ slackBotSettingParams });
  });

  /**
   * @swagger
   *
   *    /slack-integration/:
   *      put:
   *        tags: [SlackIntegration]
   *        operationId: putSlackIntegration
   *        summary: put /slack-integration
   *        description: Put SlackIntegration setting.
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SlackIntegration'
   *        responses:
   *           200:
   *             description: Succeeded to put Slack Integration setting.
   */
  router.put('/',
    accessTokenParser, loginRequiredStrictly, adminRequired, csrf, validator.SlackIntegration, apiV3FormValidator, async(req, res) => {
      const { currentBotType } = req.body;

      const requestParams = {
        'slackbot:currentBotType': currentBotType,
      };

      try {
        await updateSlackBotSettings(requestParams);
        crowi.slackBotService.publishUpdatedMessage();

        const slackIntegrationSettingsParams = {
          currentBotType: crowi.configManager.getConfig('crowi', 'slackbot:currentBotType'),
        };
        return res.apiv3({ slackIntegrationSettingsParams });
      }
      catch (error) {
        const msg = 'Error occured in updating Slack bot setting';
        logger.error('Error', error);
        return res.apiv3Err(new ErrorV3(msg, 'update-SlackIntegrationSetting-failed'), 500);
      }
    });

  router.put('/defaults',
    accessTokenParser, loginRequiredStrictly, adminRequired, csrf, apiV3FormValidator, async(req, res) => {

      await resetAllBotSettings();
      const params = { 'slackbot:currentBotType': '' };

      try {
        await updateSlackBotSettings(params);
        crowi.slackBotService.publishUpdatedMessage();

        // TODO Impl to delete AccessToken both of Proxy and GROWI when botType changes.
        const slackBotTypeParam = { slackBotType: crowi.configManager.getConfig('crowi', 'slackbot:currentBotType') };
        return res.apiv3({ slackBotTypeParam });
      }
      catch (error) {
        const msg = 'Error occured in updating Custom bot setting';
        logger.error('Error', error);
        return res.apiv3Err(new ErrorV3(msg, 'update-CustomBotSetting-failed'), 500);
      }
    });

  /**
   * @swagger
   *
   *    /slack-integration/custom-bot-without-proxy/:
   *      put:
   *        tags: [CustomBotWithoutProxy]
   *        operationId: putCustomBotWithoutProxy
   *        summary: /slack-integration/custom-bot-without-proxy
   *        description: Put customBotWithoutProxy setting.
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomBotWithoutProxy'
   *        responses:
   *           200:
   *             description: Succeeded to put CustomBotWithoutProxy setting.
   */
  router.put('/bot-type',
    accessTokenParser, loginRequiredStrictly, adminRequired, csrf, validator.BotType, apiV3FormValidator, async(req, res) => {
      const { currentBotType } = req.body;

      await resetAllBotSettings();
      const requestParams = { 'slackbot:currentBotType': currentBotType };

      try {
        await updateSlackBotSettings(requestParams);
        crowi.slackBotService.publishUpdatedMessage();

        // TODO Impl to delete AccessToken both of Proxy and GROWI when botType changes.
        const slackBotTypeParam = { slackBotType: crowi.configManager.getConfig('crowi', 'slackbot:currentBotType') };
        return res.apiv3({ slackBotTypeParam });
      }
      catch (error) {
        const msg = 'Error occured in updating Custom bot setting';
        logger.error('Error', error);
        return res.apiv3Err(new ErrorV3(msg, 'update-CustomBotSetting-failed'), 500);
      }
    });

  /**
   * @swagger
   *
   *    /slack-integration/custom-bot-without-proxy/slack-workspace-name:
   *      get:
   *        tags: [slackWorkSpaceName]
   *        operationId: getSlackWorkSpaceName
   *        summary: Get slack work space name for custom bot without proxy
   *        description: get slack WS name in custom bot without proxy
   *        responses:
   *          200:
   *            description: Succeeded to get slack ws name for custom bot without proxy
   */
  router.get('/custom-bot-without-proxy/slack-workspace-name', loginRequiredStrictly, adminRequired, async(req, res) => {

    try {
      const slackWorkSpaceName = await crowi.slackBotService.getSlackChannelName();
      return res.apiv3({ slackWorkSpaceName });
    }
    catch (error) {
      let msg = 'Error occured in slack_bot_token';
      if (error.data.error === 'missing_scope') {
        msg = 'missing_scope';
      }
      logger.error('Error', error);
      return res.apiv3Err(new ErrorV3(msg, 'get-SlackWorkSpaceName-failed'), 500);
    }

  });

  return router;
};
