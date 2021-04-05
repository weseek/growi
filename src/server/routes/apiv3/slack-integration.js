const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:notification-setting');
const express = require('express');
const { body } = require('express-validator');
const { WebClient } = require('@slack/web-api');
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
    CustomBotWithoutProxy: [
      body('slackSigningSecret').isString(),
      body('slackBotToken').isString(),
      body('currentBotType').isString(),
    ],
    SlackIntegration: [
      body('currentBotType')
        .isIn(['official-bot', 'custom-bot-without-proxy', 'custom-bot-with-proxy']),
    ],
  };

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
      accessToken: crowi.configManager.getConfig('crowi', 'slackbot:accessToken'),
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

        // initialize bolt service
        crowi.boltService.initialize();
        crowi.boltService.publishUpdatedMessage();

        const slackIntegrationSettingsParams = {
          currentBotType: crowi.configManager.getConfig('crowi', 'slackbot:currentBotType'),
        };
        return res.apiv3({ slackIntegrationSettingsParams });
      }
      catch (error) {
        const msg = 'Error occured in updating Slack bot setting';
        logger.error('Error', error);
        return res.apiv3Err(new ErrorV3(msg, 'update-SlackIntegrationSetting-failed'));
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
  router.put('/custom-bot-without-proxy',
    accessTokenParser, loginRequiredStrictly, adminRequired, csrf, validator.CustomBotWithoutProxy, apiV3FormValidator, async(req, res) => {
      const { slackSigningSecret, slackBotToken, currentBotType } = req.body;

      const requestParams = {
        'slackbot:signingSecret': slackSigningSecret,
        'slackbot:token': slackBotToken,
        'slackbot:currentBotType': currentBotType,
      };

      try {
        await updateSlackBotSettings(requestParams);

        // initialize bolt service
        crowi.boltService.initialize();
        crowi.boltService.publishUpdatedMessage();

        // TODO Impl to delete AccessToken both of Proxy and GROWI when botType changes.
        const customBotWithoutProxySettingParams = {
          slackSigningSecret: crowi.configManager.getConfig('crowi', 'slackbot:signingSecret'),
          slackBotToken: crowi.configManager.getConfig('crowi', 'slackbot:token'),
          slackBotType: crowi.configManager.getConfig('crowi', 'slackbot:currentBotType'),
        };
        return res.apiv3({ customBotWithoutProxySettingParams });
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
  router.get('/custom-bot-without-proxy/slack-workspace-name', async(req, res) => {
    // get ws name in custom bot from slackbot token
    const slackBotToken = crowi.configManager.getConfig('crowi', 'slackbot:token');

    let slackWorkSpaceName = null;
    if (slackBotToken != null) {
      const web = new WebClient(slackBotToken);
      try {
        const slackTeamInfo = await web.team.info();
        slackWorkSpaceName = slackTeamInfo.team.name;
      }
      catch (error) {
        const msg = 'Error occured in slack_bot_token';
        logger.error('Error', msg);
        return res.apiv3Err(new ErrorV3(msg, 'get-SlackWorkSpaceName-failed'));
      }
    }

    return res.apiv3({ slackWorkSpaceName });
  });

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
   *            description: Succeeded to update access token for slack
   */
  router.put('/access-token', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {

    try {
      let accessToken = '';

      if (req.body.deleteAccessToken !== true) {
        accessToken = generateAccessToken(req.user);
      }
      await updateSlackBotSettings({ 'slackbot:accessToken': accessToken });

      // initialize bolt service
      crowi.boltService.initialize();
      crowi.boltService.publishUpdatedMessage();

      return res.apiv3({ accessToken });
    }
    catch (error) {
      const msg = 'Error occured in updating access token for access token';
      logger.error('Error', error);
      return res.apiv3Err(new ErrorV3(msg, 'update-accessToken-failed'), 500);
    }
  });

  /**
   * @swagger
   *
   *    /slack-integration/access-token:
   *      delete:
   *        tags: [SlackIntegration]
   *        operationId: deleteAccessTokenForSlackBot
   *        summary: /slack-integration
   *        description: Delete accessToken
   *        responses:
   *          200:
   *            description: Succeeded to delete accessToken
   */
  router.delete('/access-token', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {

    try {
      await updateSlackBotSettings({ 'slackbot:accessToken': null });

      // initialize bolt service
      crowi.boltService.initialize();
      crowi.boltService.publishUpdatedMessage();

      return res.apiv3({});
    }
    catch (error) {
      const msg = 'Error occured in discard of slackbotAccessToken';
      logger.error('Error', error);
      return res.apiv3Err(new ErrorV3(msg, 'discard-slackbotAccessToken-failed'), 500);
    }
  });

  return router;
};
