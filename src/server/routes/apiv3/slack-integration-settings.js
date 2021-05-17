const mongoose = require('mongoose');
const express = require('express');
const { body } = require('express-validator');
const axios = require('axios');
const loggerFactory = require('@alias/logger');

const { getConnectionStatuses } = require('@growi/slack');

const ErrorV3 = require('../../models/vo/error-apiv3');

const logger = loggerFactory('growi:routes:apiv3:notification-setting');

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
      'slackbot:currentBotType': null,
      'slackbot:signingSecret': null,
      'slackbot:token': null,
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

  async function getConnectionStatusesFromProxy(tokens) {
    const csv = tokens.join(',');

    // TODO: retrieve proxy url from configManager
    const result = await axios.get('http://localhost:8080/g2s/connection-status', {
      headers: {
        'x-growi-gtop-tokens': csv,
      },
    });

    return result.data;
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

    // TODO: try-catch

    // retrieve connection statuses
    let connectionStatuses;
    if (currentBotType == null) {
      // TODO imple null action
    }
    else if (currentBotType === 'customBotWithoutProxy') {
      const token = settings.slackBotToken;
      // check the token is not null
      if (token != null) {
        connectionStatuses = await getConnectionStatuses([token]);
      }
    }
    else {
      // TODO: retrieve tokenGtoPs from DB
      const tokenGtoPs = ['gtop1'];
      connectionStatuses = (await getConnectionStatusesFromProxy(tokenGtoPs)).connectionStatuses;
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

  /*
    TODO: add swagger by GW-5930
  */

  router.delete('/bot-type',
    accessTokenParser, loginRequiredStrictly, adminRequired, csrf, apiV3FormValidator, async(req, res) => {

      await resetAllBotSettings();
      const params = { 'slackbot:currentBotType': null };

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
   *    /slack-integration/without-proxy/update-settings/:
   *      put:
   *        tags: [UpdateWithoutProxySettings]
   *        operationId: putWithoutProxySettings
   *        summary: update customBotWithoutProxy settings
   *        description: Update customBotWithoutProxy setting.
   *        responses:
   *           200:
   *             description: Succeeded to put CustomBotWithoutProxy setting.
   */
  router.put('/without-proxy/update-settings', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const currentBotType = crowi.configManager.getConfig('crowi', 'slackbot:currentBotType');
    if (currentBotType !== 'customBotWithoutProxy') {
      const msg = 'Not CustomBotWithoutProxy';
      return res.apiv3Err(new ErrorV3(msg, 'not-customBotWithoutProxy'), 400);
    }

    const { slackSigningSecret, slackBotToken } = req.body;
    const requestParams = {
      'slackbot:signingSecret': slackSigningSecret,
      'slackbot:token': slackBotToken,
    };
    try {
      await updateSlackBotSettings(requestParams);
      crowi.slackBotService.publishUpdatedMessage();

      const customBotWithoutProxySettingParams = {
        slackSigningSecret: crowi.configManager.getConfig('crowi', 'slackbot:signingSecret'),
        slackBotToken: crowi.configManager.getConfig('crowi', 'slackbot:token'),
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
   *    /slack-integration/access-tokens:
   *      put:
   *        tags: [SlackIntegration]
   *        operationId: putAccessTokens
   *        summary: /slack-integration
   *        description: Generate accessTokens
   *        responses:
   *          200:
   *            description: Succeeded to update access tokens for slack
   */
  router.put('/access-tokens', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const SlackAppIntegration = mongoose.model('SlackAppIntegration');
    let checkTokens;
    let tokenGtoP;
    let tokenPtoG;
    let generateTokens;
    do {
      generateTokens = SlackAppIntegration.generateAccessToken();
      tokenGtoP = generateTokens[0];
      tokenPtoG = generateTokens[1];
      // eslint-disable-next-line no-await-in-loop
      checkTokens = await SlackAppIntegration.findOne({ $or: [{ tokenGtoP }, { tokenPtoG }] });
    } while (checkTokens != null);
    try {
      const slackAppTokens = await SlackAppIntegration.create({ tokenGtoP, tokenPtoG });
      return res.apiv3(slackAppTokens, 200);
    }
    catch (error) {
      const msg = 'Error occured in updating access token for slack app tokens';
      logger.error('Error', error);
      return res.apiv3Err(new ErrorV3(msg, 'update-slackAppTokens-failed'), 500);
    }
  });

  router.put('/proxy-uri', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const { proxyUri } = req.body;
    console.log('proxyUri', proxyUri);

    const requestParams = { 'slackbot:serverUri': proxyUri };

    try {
      await updateSlackBotSettings(requestParams);
      crowi.slackBotService.publishUpdatedMessage();
      return res.apiv3({});
    }
    catch (error) {
      const msg = 'Error occured in updating Custom bot setting';
      logger.error('Error', error);
      return res.apiv3Err(new ErrorV3(msg, 'update-CustomBotSetting-failed'), 500);
    }

  });

  return router;
};
