const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:app-settings');

const debug = require('debug')('growi:routes:admin');

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
  mailSetting: [
    body('fromAddress').trim(),
    body('smtpHost').trim(),
    body('smtpPort').trim(),
    body('smtpUser').trim(),
    body('smtpPassword').trim(),
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
 *     SiteUrlSettingParams:
 *        type: object
 *          siteUrl:
 *            type: String
 *            description: Site URL. e.g. https://example.com, https://example.com:8080
 *          envSiteUrl:
 *            type: String
 *            description: environment variable 'APP_SITE_URL'
 *     MailSettingParams:
 *        type: object
 *          fromAddress:
 *            type: String
 *            description: e-mail address used as from address of mail which sent from GROWI app
 *          smtpHost:
 *            type: String
 *            description: host name of client's smtp server
 *          smtpPort:
 *            type: String
 *            description: port of client's smtp server
 *          smtpUser:
 *            type: String
 *            description: user name of client's smtp server
 *          smtpPassword:
 *            type: String
 *            description: password of client's smtp server
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
   *                    schema:
   *                      $ref: '#/components/schemas/AppSettingParams'
   *                      $ref: '#/components/schemas/SiteUrlSettingParams'
   *                      $ref: '#/components/schemas/MailSettingParams'
   */
  router.get('/', accessTokenParser, loginRequired, adminRequired, async(req, res) => {
    const appSettingsParams = {
      title: crowi.configManager.getConfig('crowi', 'app:title'),
      confidential: crowi.configManager.getConfig('crowi', 'app:confidential'),
      globalLang: crowi.configManager.getConfig('crowi', 'app:globalLang'),
      fileUpload: crowi.configManager.getConfig('crowi', 'app:fileUpload'),
      siteUrl: crowi.configManager.getConfig('crowi', 'app:siteUrl'),
      envSiteUrl: crowi.configManager.getConfigFromEnvVars('crowi', 'app:siteUrl'),
      fromAddress: crowi.configManager.getConfig('crowi', 'mail:from'),
      smtpHost: crowi.configManager.getConfig('crowi', 'mail:smtpHost'),
      smtpPort: crowi.configManager.getConfig('crowi', 'mail:smtpPort'),
      smtpUser: crowi.configManager.getConfig('crowi', 'mail:smtpUser'),
      smtpPassword: crowi.configManager.getConfig('crowi', 'mail:smtpPassword'),
    };
    return res.apiv3({ appSettingsParams });

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
   *                  $ref: '#/components/schemas/AppSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update app setting
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    status:
   *                      $ref: '#/components/schemas/AppSettingParams'
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
   *                  $ref: '#/components/schemas/SiteUrlSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update site url setting
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    status:
   *                      $ref: '#/components/schemas/SiteUrlSettingParams'
   */
  router.put('/site-url-setting', loginRequiredStrictly, adminRequired, csrf, validator.siteUrlSetting, ApiV3FormValidator, async(req, res) => {

    const requestSiteUrlSettingParams = {
      'app:siteUrl': req.body.siteUrl,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestSiteUrlSettingParams);
      const siteUrlSettingParams = {
        siteUrl: crowi.configManager.getConfig('crowi', 'app:siteUrl'),
      };
      return res.apiv3({ siteUrlSettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating site url setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-siteUrlSetting-failed'));
    }

  });

  /**
   * send mail (Promise wrapper)
   */
  async function sendMailPromiseWrapper(smtpClient, options) {
    return new Promise((resolve, reject) => {
      smtpClient.sendMail(options, (err, res) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(res);
        }
      });
    });
  }

  /**
   * validate mail setting send test mail
   */
  async function validateMailSetting(req) {
    const mailer = crowi.mailer;
    const option = {
      host: req.body.smtpHost,
      port: req.body.smtpPort,
    };
    if (req.body.smtpUser && req.body.smtpPassword) {
      option.auth = {
        user: req.body.smtpUser,
        pass: req.body.smtpPassword,
      };
    }
    if (option.port === 465) {
      option.secure = true;
    }

    const smtpClient = mailer.createSMTPClient(option);
    debug('mailer setup for validate SMTP setting', smtpClient);

    const mailOptions = {
      from: req.body.fromAddress,
      to: req.user.email,
      subject: 'Wiki管理設定のアップデートによるメール通知',
      text: 'このメールは、WikiのSMTP設定のアップデートにより送信されています。',
    };

    await sendMailPromiseWrapper(smtpClient, mailOptions);
  }

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
   *                  $ref: '#/components/schemas/MailSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update site url setting
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    status:
   *                      $ref: '#/components/schemas/MailSettingParams'
   */
  router.put('/mail-setting', loginRequiredStrictly, adminRequired, csrf, validator.mailSetting, ApiV3FormValidator, async(req, res) => {
    // テストメール送信によるバリデート
    try {
      await validateMailSetting(req);
    }
    catch (err) {
      const msg = 'SMTPを利用したテストメール送信に失敗しました。設定をみなおしてください。';
      logger.error('Error', err);
      debug('Error validate mail setting: ', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-mailSetting-failed'));
    }


    const requestMailSettingParams = {
      'mail:from': req.body.fromAddress,
      'mail:smtpHost': req.body.smtpHost,
      'mail:smtpPort': req.body.smtpPort,
      'mail:smtpUser': req.body.smtpUser,
      'mail:smtpPassword': req.body.smtpPassword,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestMailSettingParams);
      const mailSettingParams = {
        fromAddress: crowi.configManager.getConfig('crowi', 'mail:from'),
        smtpHost: crowi.configManager.getConfig('crowi', 'mail:smtpHost'),
        smtpPort: crowi.configManager.getConfig('crowi', 'mail:smtpPort'),
        smtpUser: crowi.configManager.getConfig('crowi', 'mail:smtpUser'),
        smtpPassword: crowi.configManager.getConfig('crowi', 'mail:smtpPassword'),
      };
      return res.apiv3({ mailSettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating mail setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-mailSetting-failed'));
    }
  });

  return router;
};
