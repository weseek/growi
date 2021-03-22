const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:notification-setting');
const express = require('express');
const { body } = require('express-validator');
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
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);


  const validator = {
    CusotmBotSettings: [
      body('slackSigningSecret').isString(),
      body('slackBotToken').isString(),
      body('botType').isString(),
    ],
  };

  async function updateSlackBotSettings(params) {
    const { configManager } = crowi;
    // update config without publishing S2sMessage
    return configManager.updateConfigsInTheSameNamespace('crowi', params, true);
  }

  /**
   * @swagger
   *
   *    /slack-integration/:
   *      get:
   *        tags: [CustomBot]
   *        operationId: getCustomBotSetting
   *        summary: /slack-integration
   *        description: Get singingSecret, slackBotToken and botType
   *        responses:
   *          200:
   *            description: Succeeded to get SigningSecret, SlackBotToken and BotType.
   */
  router.get('/', accessTokenParser, loginRequiredStrictly, adminRequired, async(req, res) => {

    const slackBotSettingParams = {
      slackBotType: crowi.configManager.getConfig('crowi', 'slackbot:type'),
      // TODO impl when creating official bot
      officialBotSettings: {
        // TODO impl this after GW-4939
        // AccessToken: "tempaccessdatahogehoge",
      },
      cusotmBotNonProxySettings: {
        // TODO impl this after GW-4939
        // AccessToken: "tempaccessdatahogehoge",
        slackSigningSecret: crowi.configManager.getConfig('crowi', 'slackbot:signingSecret'),
        slackBotToken: crowi.configManager.getConfig('crowi', 'slackbot:token'),
      },
      // TODO imple when creating with proxy
      cusotmBotWithProxySettings: {
        // TODO impl this after GW-4939
        // AccessToken: "tempaccessdatahogehoge",
      },
    };
    return res.apiv3({ slackBotSettingParams });
  });

  /**
   * @swagger
   *
   *    /slack-integration/custom-bot-setting/:
   *      put:
   *        tags: [CustomBot]
   *        operationId: putCustomBotSetting
   *        summary: /slack-integration/custom-bot-setting
   *        description: Put singingSecret, slackBotToken and botType
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomBot'
   *        responses:
   *           200:
   *             description: Succeeded to put SigningSecret, SlackBotToken and BotType.
   */
  router.put('/custom-bot-non-proxy',
    accessTokenParser, loginRequiredStrictly, adminRequired, csrf, validator.CusotmBotSettings, apiV3FormValidator, async(req, res) => {
      const { slackSigningSecret, slackBotToken, botType } = req.body;

      const requestParams = {
        'slackbot:signingSecret': slackSigningSecret,
        'slackbot:token': slackBotToken,
        'slackbot:type': botType,
      };

      try {
        await updateSlackBotSettings(requestParams);
        // TODO Impl to delete AccessToken both of Proxy and GROWI when botType changes.
        const customBotNonProxySettingsParams = {
          slackSigningSecret: crowi.configManager.getConfig('crowi', 'slackbot:signingSecret'),
          slackBotToken: crowi.configManager.getConfig('crowi', 'slackbot:token'),
          slackBotType: crowi.configManager.getConfig('crowi', 'slackbot:type'),
        };
        return res.apiv3({ customBotNonProxySettingsParams });
      }
      catch (error) {
        const msg = 'Error occured in updating Custom bot setting';
        logger.error('Error', error);
        return res.apiv3Err(new ErrorV3(msg, 'update-CustomBotSetting-failed'));
      }
    });

  return router;
};
