const mongoose = require('mongoose');
const express = require('express');
const { body, query } = require('express-validator');
const axios = require('axios');
const urljoin = require('url-join');
const loggerFactory = require('@alias/logger');

const { getConnectionStatus, getConnectionStatuses, sendSuccessMessage } = require('@growi/slack');

const ErrorV3 = require('../../models/vo/error-apiv3');

const logger = loggerFactory('growi:routes:apiv3:slack-integration-settings');

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
    proxyUri: [
      body('proxyUri').if(value => value !== '').trim().matches(/^(https?:\/\/)/)
        .isURL({ require_tld: false }),
    ],
    RelationTest: [
      body('slackAppIntegrationId').isMongoId(),
      body('channel').trim().isString(),
    ],
    deleteIntegration: [
      query('integrationIdToDelete').isMongoId(),
    ],
    SlackChannel: [
      body('channel').trim().not().isEmpty()
        .isString(),
    ],
  };

  async function resetAllBotSettings() {
    await SlackAppIntegration.deleteMany();

    const params = {
      'slackbot:currentBotType': null,
      'slackbot:signingSecret': null,
      'slackbot:token': null,
      'slackbot:proxyServerUri': null,
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
    const proxyUri = crowi.configManager.getConfig('crowi', 'slackbot:proxyServerUri');

    const result = await axios.get(urljoin(proxyUri, '/g2s/connection-status'), {
      headers: {
        'x-growi-gtop-tokens': csv,
      },
    });

    return result.data;
  }

  async function postRelationTest(token) {
    const proxyUri = crowi.configManager.getConfig('crowi', 'slackbot:proxyServerUri');
    if (proxyUri == null) {
      throw new Error('Proxy URL is not registered');
    }

    const result = await axios.get(urljoin(proxyUri, '/g2s/relation-test'), {
      headers: {
        'x-growi-gtop-tokens': token,
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
      settings.proxyServerUri = crowi.configManager.getConfig('crowi', 'slackbot:proxyServerUri');
      settings.proxyUriEnvVars = configManager.getConfigFromEnvVars('crowi', 'slackbot:proxyServerUri');
    }

    // retrieve connection statuses
    let connectionStatuses = {};
    let errorMsg;
    let errorCode;
    if (currentBotType == null) {
      // no need to do anything
    }
    else if (currentBotType === 'customBotWithoutProxy') {
      const token = settings.slackBotToken;
      // check the token is not null
      if (token != null) {
        try {
          connectionStatuses = await getConnectionStatuses([token]);
        }
        catch (e) {
          errorMsg = 'Error occured in getting connection statuses';
          errorCode = 'get-connection-failed';
          logger.error(errorMsg, e);
        }
      }
    }
    else {
      try {
        const slackAppIntegrations = await SlackAppIntegration.find();
        settings.slackAppIntegrations = slackAppIntegrations;
      }
      catch (e) {
        errorMsg = 'Error occured in finding SlackAppIntegration entities.';
        errorCode = 'get-slackappintegration-failed';
        logger.error(errorMsg, e);
      }

      const proxyServerUri = settings.proxyServerUri;

      if (proxyServerUri != null && settings.slackAppIntegrations != null && settings.slackAppIntegrations.length > 0) {
        try {
          // key: slackAppIntegration.tokenGtoP, value: slackAppIntegration._id
          const tokenGtoPToSlackAppIntegrationId = {};
          settings.slackAppIntegrations.forEach((slackAppIntegration) => {
            tokenGtoPToSlackAppIntegrationId[slackAppIntegration.tokenGtoP] = slackAppIntegration._id;
          });
          const result = (await getConnectionStatusesFromProxy(Object.keys(tokenGtoPToSlackAppIntegrationId)));
          Object.entries(result.connectionStatuses).forEach(([tokenGtoP, connectionStatus]) => {
            connectionStatuses[tokenGtoPToSlackAppIntegrationId[tokenGtoP]] = connectionStatus;
          });
        }
        catch (e) {
          errorMsg = 'Incorrect Proxy URL';
          errorCode = 'test-connection-failed';
          logger.error(errorMsg, e);
        }
      }
    }

    return res.apiv3({
      currentBotType, settings, connectionStatuses, errorMsg, errorCode,
    });
  });

  /**
   * @swagger
   *
   *    /slack-integration-settings/:
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

    if (currentBotType === 'officialBot') {
      requestParams['slackbot:proxyServerUri'] = 'https://slackbot-proxy.growi.org';
    }

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
   *    /slack-integration-settings/slack-app-integrations:
   *      put:
   *        tags: [SlackIntegration]
   *        operationId: putSlackAppIntegrations
   *        summary: /slack-integration
   *        description: Generate SlackAppIntegrations
   *        responses:
   *          200:
   *            description: Succeeded to create slack app integration
   */
  router.put('/slack-app-integrations', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    const SlackAppIntegrationRecordsNum = await SlackAppIntegration.countDocuments();
    if (SlackAppIntegrationRecordsNum >= 10) {
      const msg = 'Not be able to create more than 10 slack workspace integration settings';
      logger.error('Error', msg);
      return res.apiv3Err(new ErrorV3(msg, 'create-slackAppIntegeration-failed'), 500);
    }

    const { tokenGtoP, tokenPtoG } = await SlackAppIntegration.generateUniqueAccessTokens();

    try {
      const slackAppTokens = await SlackAppIntegration.create({ tokenGtoP, tokenPtoG });
      return res.apiv3(slackAppTokens, 200);
    }
    catch (error) {
      const msg = 'Error occurred during creating slack integration settings procedure';
      logger.error('Error', error);
      return res.apiv3Err(new ErrorV3(msg, 'creating-slack-integration-settings-procedure-failed'), 500);
    }
  });

  /**
   * @swagger
   *
   *    /slack-integration-settings/regenerate-tokens:
   *      put:
   *        tags: [SlackIntegration]
   *        operationId: putRegenerateTokens
   *        summary: /slack-integration
   *        description: Regenerate SlackAppTokens
   *        responses:
   *          200:
   *            description: Succeeded to regenerate slack app tokens
   */
  router.put('/regenerate-tokens', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {

    const { slackAppIntegrationId } = req.body;

    try {
      const { tokenGtoP, tokenPtoG } = await SlackAppIntegration.generateUniqueAccessTokens();
      const slackAppTokens = await SlackAppIntegration.findByIdAndUpdate(slackAppIntegrationId, { tokenGtoP, tokenPtoG });

      return res.apiv3(slackAppTokens, 200);
    }
    catch (error) {
      const msg = 'Error occurred during regenerating slack app tokens';
      logger.error('Error', error);
      return res.apiv3Err(new ErrorV3(msg, 'regenerating-slackAppTokens-failed'), 500);
    }
  });

  /**
   * @swagger
   *
   *    /slack-integration-settings/slack-app-integration:
   *      delete:
   *        tags: [SlackIntegration]
   *        operationId: deleteAccessTokens
   *        summary: delete accessTokens
   *        description: Delete accessTokens
   *        responses:
   *          200:
   *            description: Succeeded to delete access tokens for slack
   */
  router.delete('/slack-app-integration', validator.deleteIntegration, apiV3FormValidator, async(req, res) => {
    const SlackAppIntegration = mongoose.model('SlackAppIntegration');
    const { integrationIdToDelete } = req.query;
    try {
      const response = await SlackAppIntegration.findOneAndDelete({ _id: integrationIdToDelete });
      return res.apiv3({ response });
    }
    catch (error) {
      const msg = 'Error occured in deleting access token for slack app tokens';
      logger.error('Error', error);
      return res.apiv3Err(new ErrorV3(msg, 'update-slackAppTokens-failed'), 500);
    }
  });

  router.put('/proxy-uri', loginRequiredStrictly, adminRequired, csrf, validator.proxyUri, apiV3FormValidator, async(req, res) => {
    const { proxyUri } = req.body;

    const requestParams = { 'slackbot:proxyServerUri': proxyUri };

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

  /**
   * @swagger
   *
   *    /slack-integration-settings/with-proxy/relation-test:
   *      post:
   *        tags: [botType]
   *        operationId: postRelationTest
   *        summary: /slack-integration/bot-type
   *        description: Delete botType setting.
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  slackAppIntegrationId:
   *                    type: string
   *        responses:
   *           200:
   *             description: Succeeded to delete botType setting.
   */
  router.post('/with-proxy/relation-test', loginRequiredStrictly, adminRequired, csrf, validator.RelationTest, apiV3FormValidator, async(req, res) => {
    const currentBotType = crowi.configManager.getConfig('crowi', 'slackbot:currentBotType');
    if (currentBotType === 'customBotWithoutProxy') {
      const msg = 'Not Proxy Type';
      return res.apiv3Err(new ErrorV3(msg, 'not-proxy-type'), 400);
    }

    const { slackAppIntegrationId } = req.body;
    let slackBotToken;
    try {
      const slackAppIntegration = await SlackAppIntegration.findOne({ _id: slackAppIntegrationId });
      if (slackAppIntegration == null) {
        const msg = 'Could not find SlackAppIntegration by id';
        return res.apiv3Err(new ErrorV3(msg, 'find-slackAppIntegration-failed'), 400);
      }
      const result = await postRelationTest(slackAppIntegration.tokenGtoP);
      slackBotToken = result.slackBotToken;
      if (slackBotToken == null) {
        const msg = 'Could not find slackBotToken by relation';
        return res.apiv3Err(new ErrorV3(msg, 'find-slackBotToken-failed'), 400);
      }
    }
    catch (error) {
      logger.error('Error', error);
      return res.apiv3Err(new ErrorV3(`Error occured while testing. Cause: ${error.message}`, 'test-failed', error.stack));
    }

    const { channel } = req.body;
    const appSiteURL = crowi.configManager.getConfig('crowi', 'app:siteUrl');
    try {
      await sendSuccessMessage(slackBotToken, channel, appSiteURL);
    }
    catch (error) {
      return res.apiv3Err(new ErrorV3(`Error occured while sending message. Cause: ${error.message}`, 'send-message-failed', error.stack));
    }
    return res.apiv3();

  });

  /**
   * @swagger
   *
   *    /slack-integration-settings/without-proxy/test:
   *      post:
   *        tags: [botType]
   *        operationId: postTest
   *        summary: test the connection
   *        description: Test the connection with slack work space.
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  testChannel:
   *                    type: string
   *        responses:
   *           200:
   *             description: Succeeded to connect to slack work space.
   */
  router.post('/without-proxy/test', loginRequiredStrictly, adminRequired, csrf, validator.SlackChannel, apiV3FormValidator, async(req, res) => {
    const currentBotType = crowi.configManager.getConfig('crowi', 'slackbot:currentBotType');
    if (currentBotType !== 'customBotWithoutProxy') {
      const msg = 'Select Without Proxy Type';
      return res.apiv3Err(new ErrorV3(msg, 'select-not-proxy-type'), 400);
    }

    const slackBotToken = crowi.configManager.getConfig('crowi', 'slackbot:token');
    const status = await getConnectionStatus(slackBotToken);
    if (status.error != null) {
      return res.apiv3Err(new ErrorV3(`Error occured while getting connection. ${status.error}`, 'send-message-failed'));
    }

    const { channel } = req.body;
    const appSiteURL = crowi.configManager.getConfig('crowi', 'app:siteUrl');
    try {
      await sendSuccessMessage(slackBotToken, channel, appSiteURL);
    }
    catch (error) {
      return res.apiv3Err(new ErrorV3(`Error occured while sending message. Cause: ${error.message}`, 'send-message-failed', error.stack));
    }

    return res.apiv3();
  });

  return router;
};
