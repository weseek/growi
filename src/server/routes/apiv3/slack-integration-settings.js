const mongoose = require('mongoose');
const express = require('express');
const { body } = require('express-validator');
const axios = require('axios');
const urljoin = require('url-join');
const loggerFactory = require('@alias/logger');

const { getConnectionStatuses } = require('@growi/slack');

const ErrorV3 = require('../../models/vo/error-apiv3');

const logger = loggerFactory('growi:routes:apiv3:notification-setting');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: SlackIntegrationSettings
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      BotType:
 *        description: BotType
 *        properties:
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

  const SlackAppIntegration = mongoose.model('SlackAppIntegration');

  const validator = {
    BotType: [
      body('currentBotType').isString(),
    ],
    SlackIntegration: [
      body('currentBotType')
        .isIn(['officialBot', 'customBotWithoutProxy', 'customBotWithProxy']),
    ],
    TestConnection: [
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
    const proxyUri = crowi.configManager.getConfig('crowi', 'slackbot:serverUri');

    const result = await axios.get(urljoin(proxyUri, '/g2s/connection-status'), {
      headers: {
        'x-growi-gtop-tokens': csv,
      },
    });

    return result.data;
  }

  /**
   * @swagger
   *
   *    /slack-integration-settings/:
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
      settings.proxyUri = crowi.configManager.getConfig('crowi', 'slackbot:serverUri');
      settings.proxyUriEnvVars = configManager.getConfigFromEnvVars('crowi', 'slackbot:serverUri');
    }

    // retrieve connection statuses
    let connectionStatuses;
    if (currentBotType == null) {
      // TODO imple null action
    }
    else if (currentBotType === 'customBotWithoutProxy') {
      const token = settings.slackBotToken;
      // check the token is not null
      if (token != null) {
        try {
          connectionStatuses = await getConnectionStatuses([token]);
        }
        catch (error) {
          const msg = 'Error occured in getting connection statuses';
          logger.error('Error', error);
          return res.apiv3Err(new ErrorV3(msg, 'get-connection-failed'), 500);
        }
      }
    }
    else {
      const proxyUri = settings.proxyUri;

      if (proxyUri != null) {
        try {
          const slackAppIntegrations = await SlackAppIntegration.find();
          settings.slackAppIntegrations = slackAppIntegrations;

          if (slackAppIntegrations.length > 0) {
            const tokenGtoPs = slackAppIntegrations.map(slackAppIntegration => slackAppIntegration.tokenGtoP);
            connectionStatuses = (await getConnectionStatusesFromProxy(tokenGtoPs)).connectionStatuses;
          }
        }
        catch (error) {
          const msg = 'Error occured in getting connection statuses';
          logger.error('Error', error);
          return res.apiv3Err(new ErrorV3(msg, 'get-connection-failed'), 500);
        }
      }
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
  router.put('/', accessTokenParser, loginRequiredStrictly, adminRequired, csrf, validator.SlackIntegration, apiV3FormValidator, async(req, res) => {
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
   *    /slack-integration/test-connection:
   *      get:
   *        tags: [SlackBotSettingParams]
   *        operationId: getSlackBotSettingParams
   *        summary: get /slack-integration
   *        description: Get current settings and connection statuses.
   *        responses:
   *          200:
   *            description: Succeeded to get info.
   */
  router.post('/test-connection', accessTokenParser, loginRequiredStrictly, adminRequired, csrf, validator.TestConnection, apiV3FormValidator,
    async(req, res) => {
      // const { configManager } = crowi;
      // const currentBotType = configManager.getConfig('crowi', 'slackbot:currentBotType');
      const { channel } = req.body;
      const slackBotToken = crowi.configManager.getConfig('crowi', 'slackbot:token');
      this.client = new WebClient(slackBotToken, { logLevel: LogLevel.DEBUG });
      logger.debug('SlackBot: setup is done');

      try {
        const response = await this.client.chat.postMessage({
          channel: `#${channel}`,
          text: 'Your test was successful!',
        });
        logger.info(`SlackTest: send success massage to slack work space at #${channel}.`);
        logger.info(`If you do not receive a message, you may not have invited the bot to the #${channel} channel.`);
        // eslint-disable-next-line max-len
        const message = `Successfully send message to Slack work space. See #general channel. If you do not receive a message, you may not have invited the bot to the #${channel} channel.`;
        console.log(response);
        return res.apiv3({ message });
      }
      catch (error) {
        const msg = 'ERROR';
        return res.apiv3Err(new ErrorV3(msg, 'notification-test-slack-work-space-failed'), 500);
      }

      // try {
      //   // retrieve settings
      //   const settings = {};
      //   if (currentBotType === 'customBotWithoutProxy') {
      //     settings.slackSigningSecretEnvVars = configManager.getConfigFromEnvVars('crowi', 'slackbot:signingSecret');
      //     settings.slackBotTokenEnvVars = configManager.getConfigFromEnvVars('crowi', 'slackbot:token');
      //     settings.slackSigningSecret = configManager.getConfig('crowi', 'slackbot:signingSecret');
      //     settings.slackBotToken = configManager.getConfig('crowi', 'slackbot:token');
      //   }
      //   else {
      //     // settings.proxyUriEnvVars = ;
      //     // settings.proxyUri = ;
      //     // settings.tokenPtoG = ;
      //     // settings.tokenGtoP = ;
      //   }


      //   // retrieve connection statuses
      //   let connectionStatuses;
      //   if (currentBotType == null) {
      //     // TODO imple null action
      //   }
      //   else if (currentBotType === 'customBotWithoutProxy') {
      //     const token = settings.slackBotToken;
      //     // check the token is not null
      //     if (token != null) {
      //       connectionStatuses = await getConnectionStatuses([token]);
      //     }
      //   }
      //   else {
      //     // TODO: retrieve tokenGtoPs from DB
      //     const tokenGtoPs = ['gtop1'];
      //     connectionStatuses = (await getConnectionStatusesFromProxy(tokenGtoPs)).connectionStatuses;
      //   }

      //   return res.apiv3({ currentBotType, settings, connectionStatuses });
      // }
      // catch (error) {
      //   const msg = 'Error occured in testing Slack bot setting';
      //   logger.error('Error', error);
      //   return res.apiv3Err(new ErrorV3(msg, 'update-SlackIntegrationSetting-failed'), 500);
      // }
    });

  /**
   * @swagger
   *
   *    /slack-integration-settings/bot-type/:
   *      put:
   *        tags: [botType]
   *        operationId: putBotType
   *        summary: /slack-integration/bot-type
   *        description: Put botType setting.
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/BotType'
   *        responses:
   *           200:
   *             description: Succeeded to put botType setting.
   */
  router.put('/bot-type', accessTokenParser, loginRequiredStrictly, adminRequired, csrf, validator.BotType, apiV3FormValidator, async(req, res) => {
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
   *    /slack-integration/bot-type/:
   *      delete:
   *        tags: [botType]
   *        operationId: deleteBotType
   *        summary: /slack-integration/bot-type
   *        description: Delete botType setting.
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/BotType'
   *        responses:
   *           200:
   *             description: Succeeded to delete botType setting.
   */
  router.delete('/bot-type', accessTokenParser, loginRequiredStrictly, adminRequired, csrf, apiV3FormValidator, async(req, res) => {

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
   *    /slack-integration-settings/without-proxy/update-settings/:
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
   *    /slack-integration-settings/access-tokens:
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
