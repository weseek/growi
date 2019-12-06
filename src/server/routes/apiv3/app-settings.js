const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:app-settings');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');

const ErrorV3 = require('../../models/vo/error-apiv3');

const validator = {
  appSetting: [
    body('title').trim(),
    body('confidential'),
    body('globalLang').isIn(['en-US', 'ja']),
    body('fileUpload').isBoolean(),
  ],
  siteUrlSetting: [
    body('siteUrl').trim(),
  ],
};


/**
 * @swagger
 *  tags:
 *    name: AppSettings
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      AppSettingParams:
 *        type: object
 *        properties:
 *          title:
 *            type: String
 *            description: site name show on page header and tilte of HTML
 *          confidential:
 *            type: String
 *            description: confidential show on page header
 *          globalLang:
 *            type: String
 *            description: language set when create user
 *          fileUpload:
 *            type: boolean
 *            description: enable upload file except image file
 *          siteUrl:
 *            type: String
 *            description: Site URL. e.g. https://example.com, https://example.com:8080
 *          envSiteUrl:
 *            type: String
 *            description: environment variable 'APP_SITE_URL'
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middleware/access-token-parser')(crowi);
  const loginRequired = require('../../middleware/login-required')(crowi);
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { ApiV3FormValidator } = crowi.middlewares;

  /**
   * @swagger
   *
   *    /app-settings/:
   *      get:
   *        tags: [AppSettings]
   *        description: get app setting params
   *        responses:
   *          200:
   *            description: Resources are available
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    title:
   *                      type: String
   *                      description: site name show on page header and tilte of HTML
   *                    confidential:
   *                      type: String
   *                      description: confidential show on page header
   *                    globalLang:
   *                      type: String
   *                      description: language set when create user
   *                    fileUpload:
   *                      type: boolean
   *                      description: enable upload file except image file
   *                    siteUrl:
   *                      type: String
   *                      description: Site URL. e.g. https://example.com, https://example.com:8080
   *                    envSiteUrl:
   *                      type: String
   *                      description: environment variable 'APP_SITE_URL'
   */
  router.get('/', accessTokenParser, loginRequired, adminRequired, async(req, res) => {
    const appSettingParams = {
      title: crowi.configManager.getConfig('crowi', 'app:title'),
      confidential: crowi.configManager.getConfig('crowi', 'app:confidential'),
      globalLang: crowi.configManager.getConfig('crowi', 'app:globalLang'),
      fileUpload: crowi.configManager.getConfig('crowi', 'app:fileUpload'),
      siteUrl: crowi.configManager.getConfig('crowi', 'app:siteUrl'),
      envSiteUrl: crowi.configManager.getConfigFromEnvVars('crowi', 'app:siteUrl'),
    };
    return res.apiv3({ appSettingParams });

  });


  /**
   * @swagger
   *
   *    /app-settings/app-setting:
   *      put:
   *        tags: [AppSettings]
   *        description: Update app setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  title:
   *                    type: String
   *                    description: site name show on page header and tilte of HTML
   *                  confidential:
   *                    type: String
   *                    description: confidential show on page header
   *                  globalLang:
   *                    type: String
   *                    description: language set when create user
   *                  fileUpload:
   *                    type: boolean
   *                    description: enable upload file except image file
   *        responses:
   *          200:
   *            description: Succeeded to update app setting
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    status:
   *                      $ref: '#/components/schemas/appSettingParams'
   */
  router.put('/app-setting', loginRequiredStrictly, adminRequired, csrf, validator.appSetting, ApiV3FormValidator, async(req, res) => {

    const requestAppSettingParams = {
      'app:title': req.body.title,
      'app:confidential': req.body.confidential,
      'app:globalLang': req.body.globalLang,
      'app:fileUpload': req.body.fileUpload,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestAppSettingParams);
      const appSettingParams = {
        title: crowi.configManager.getConfig('crowi', 'app:title'),
        confidential: crowi.configManager.getConfig('crowi', 'app:confidential'),
        globalLang: crowi.configManager.getConfig('crowi', 'app:globalLang'),
        fileUpload: crowi.configManager.getConfig('crowi', 'app:fileUpload'),
      };
      return res.apiv3({ appSettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating app setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-appSetting-failed'));
    }

  });

  /**
 * @swagger
 *
 *    /app-settings/site-url-setting:
 *      put:
 *        tags: [AppSettings]
 *        description: Update site url setting
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  siteUrl:
 *                    type: String
 *                    description: Site URL. e.g. https://example.com, https://example.com:8080
 *        responses:
 *          200:
 *            description: Succeeded to update site url setting
 *            content:
 *              application/json:
 *                schema:
 *                  properties:
 *                    status:
 *                      $ref: '#/components/schemas/appSettingParams'
 */
  router.put('/site-url-setting', loginRequiredStrictly, adminRequired, csrf, validator.siteUrlSetting, ApiV3FormValidator, async(req, res) => {

    const requestSiteUrlSettingParams = {
      'app:siteUrl': req.body.siteUrl,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestSiteUrlSettingParams);
      const appSettingParams = {
        siteUrl: crowi.configManager.getConfig('crowi', 'app:siteUrl'),
      };
      return res.apiv3({ appSettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating site url setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-siteUrlSetting-failed'));
    }

  });


  return router;
};
