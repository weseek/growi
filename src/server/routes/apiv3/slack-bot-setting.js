const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:notification-setting');
const express = require('express');
const { body } = require('express-validator');
const ErrorV3 = require('../../models/vo/error-apiv3');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: SlackBotSetting
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      CustomBot:
 *        description: CustomizeFunction
 *        type: object
 *        properties:
 *          slackSigningSecret:
 *            type: string
 *          slackBotToken:
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
      body('slackSigningSecret').exists({ checkFalsy: true }).isString(),
      body('slackBotToken').exists({ checkFalsy: true }).isString(),
    ],
  };

  async function updateCustomBotSettings(params) {
    const { configManager } = crowi;
    // update config without publishing S2sMessage
    return configManager.updateConfigsInTheSameNamespace('crowi', params, true);
  }

  /**
   * @swagger
   *
   *    slack-bot-setting/custom-bot-setting/:
   *      get:
   *        tags: [CustomBot]
   *        operationId: getCustomBotSetting
   *        summary: /slack-bot-setting/custom-bot-setting
   *        description: Get singingSecret and slackBotToken
   *        responses:
   *          200:
   *            description: Succeeded to get SigningSecret and SlackBotToken.
   */
  router.get('/custom-bot-setting', accessTokenParser, loginRequiredStrictly, adminRequired, async(req, res) => {

    const slackBotSettingParams = {
      slackSigningSecret: await crowi.configManager.getConfig('crowi', 'slackbot:signingSecret'),
      slackBotToken: await crowi.configManager.getConfig('crowi', 'slackbot:token'),
    };
    return res.apiv3({ slackBotSettingParams });
  });

  /**
   * @swagger
   *   paths:
   *     slack-bot-setting/custom-bot-setting/:
   *      put:
   *        tags: [CustomBot]
   *        operationId: putCustomBotSetting
   *        summary: /slack-bot-setting/custom-bot-setting
   *        description: Put singingSecret and slackBotToken
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              shema:
   *                $ref: '#/components/schemas/CustomBot
   *        responses:
   *          200:
   *            description: Succeeded to put SigningSecret and SlackBotToken.
   */
  router.put('/custom-bot-setting',
    accessTokenParser, loginRequiredStrictly, adminRequired, csrf, validator.CusotmBotSettings, apiV3FormValidator, async(req, res) => {
      const { slackSigningSecret, slackBotToken } = req.body;
      const requestParams = {
        'slackbot:signingSecret': slackSigningSecret,
        'slackbot:token': slackBotToken,
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
        return res.apiv3Err(new ErrorV3(msg, 'update Custom bot failed'));
      }
    });

  return router;
};
