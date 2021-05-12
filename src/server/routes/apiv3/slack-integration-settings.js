const loggerFactory = require('@alias/logger');

const { getConnectionStatuses } = require('@growi/slack');

const logger = loggerFactory('growi:routes:apiv3:notification-setting');
const express = require('express');
const { body } = require('express-validator');
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
        .isIn(['officialBot', 'customBotWithoutProxy', 'customBotWithProxy']),
    ],
    NotificationTestToSlackWorkSpace: [
      body('channel').trim().not().isEmpty()
        .isString(),
    ],
  };

  async function updateSlackBotSettings(params) {
    const { configManager } = crowi;
    // update config without publishing S2sMessage
    return configManager.updateConfigsInTheSameNamespace('crowi', params, true);
  }

  // eslint-disable-next-line no-unused-vars
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
   *        description: Get current settings and connection statuses.
   *        responses:
   *          200:
   *            description: Succeeded to get info.
   */
  router.get('/', accessTokenParser, loginRequiredStrictly, adminRequired, async(req, res) => {
    const { configManager } = crowi;
    const currentBotType = configManager.getConfig('crowi', 'slackbot:currentBotType');

    // retrieve settings
    const settings = {};
    if (currentBotType === 'customBotWithoutProxy') {
      settings.slackSigningSecretEnvVars = configManager.getConfigFromEnvVars('crowi', 'slackbot:signingSecret');
      settings.slackBotTokenEnvVars = configManager.getConfigFromEnvVars('crowi', 'slackbot:token');
      settings.slackSigningSecret = configManager.getConfig('crowi', 'slackbot:signingSecret');
      settings.slackBotToken = configManager.getConfig('crowi', 'slackbot:token');
    }
    else {
      // settings.proxyUriEnvVars = ;
      // settings.proxyUri = ;
      // settings.tokenPtoG = ;
      // settings.tokenGtoP = ;
    }

    // retrieve connection statuses
    let connectionStatuses;
    if (currentBotType === 'customBotWithoutProxy') {
      const token = settings.slackBotToken;
      // check the token is not null
      if (token != null) {
        connectionStatuses = Object.fromEntries(await getConnectionStatuses([token]));
      }
    }
    else {
      // connectionStatuses = getConnectionStatusesFromProxy();
    }

    return res.apiv3({ currentBotType, settings, connectionStatuses });
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
        crowi.slackBotService.publishUpdatedMessage();

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

  return router;
};
