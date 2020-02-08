const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:app-settings');

const debug = require('debug')('growi:routes:admin');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');
const ErrorV3 = require('../../models/vo/error-apiv3');

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
 *        description: AppSettingParams
 *        type: object
 *        properties:
 *          title:
 *            type: string
 *            description: site name show on page header and tilte of HTML
 *          confidential:
 *            type: string
 *            description: confidential show on page header
 *          globalLang:
 *            type: string
 *            description: language set when create user
 *          fileUpload:
 *            type: boolean
 *            description: enable upload file except image file
 *      SiteUrlSettingParams:
 *        description: SiteUrlSettingParams
 *        type: object
 *        properties:
 *          siteUrl:
 *            type: string
 *            description: Site URL. e.g. https://example.com, https://example.com:8080
 *          envSiteUrl:
 *            type: string
 *            description: environment variable 'APP_SITE_URL'
 *      MailSettingParams:
 *        description: MailSettingParams
 *        type: object
 *        properties:
 *          fromAddress:
 *            type: string
 *            description: e-mail address used as from address of mail which sent from GROWI app
 *          smtpHost:
 *            type: string
 *            description: host name of client's smtp server
 *          smtpPort:
 *            type: string
 *            description: port of client's smtp server
 *          smtpUser:
 *            type: string
 *            description: user name of client's smtp server
 *          smtpPassword:
 *            type: string
 *            description: password of client's smtp server
 *      AwsSettingParams:
 *        description: AwsSettingParams
 *        type: object
 *        properties:
 *          region:
 *            type: string
 *            description: region of AWS S3
 *          customEndpoint:
 *            type: string
 *            description: custom endpoint of AWS S3
 *          bucket:
 *            type: string
 *            description: AWS S3 bucket name
 *          accessKeyId:
 *            type: string
 *            description: accesskey id for authentification of AWS
 *          secretAccessKey:
 *            type: string
 *            description: secret key for authentification of AWS
 *      PluginSettingParams:
 *        description: PluginSettingParams
 *        type: object
 *        properties:
 *          isEnabledPlugins:
 *            type: string
 *            description: enable use plugins
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middleware/access-token-parser')(crowi);
  const loginRequired = require('../../middleware/login-required')(crowi);
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { ApiV3FormValidator } = crowi.middlewares;

  const validator = {
    appSetting: [
      body('title').trim(),
      body('confidential'),
      body('globalLang').isIn(['en-US', 'ja']),
      body('fileUpload').isBoolean(),
    ],
    siteUrlSetting: [
      body('siteUrl').trim().matches(/^(https?:\/\/[^/]+|)$/).isURL({ require_tld: false }),
    ],
    mailSetting: [
      body('fromAddress').trim().isEmail(),
      body('smtpHost').trim(),
      body('smtpPort').trim().isPort(),
      body('smtpUser').trim(),
      body('smtpPassword').trim(),
    ],
    awsSetting: [
      body('region').trim().matches(/^[a-z]+-[a-z]+-\d+$/).withMessage('リージョンには、AWSリージョン名を入力してください。 例: ap-northeast-1'),
      body('customEndpoint').trim().matches(/^(https?:\/\/[^/]+|)$/).withMessage('カスタムエンドポイントは、http(s)://で始まるURLを指定してください。また、末尾の/は不要です。'),
      body('bucket').trim(),
      body('accessKeyId').trim().matches(/^[\da-zA-Z]+$/),
      body('secretAccessKey').trim(),
    ],
    pluginSetting: [
      body('isEnabledPlugins').isBoolean(),
    ],
  };

  /**
   * @swagger
   *
   *    /app-settings:
   *      get:
   *        tags: [AppSettings]
   *        operationId: getAppSettings
   *        summary: /app-settings
   *        description: get app setting params
   *        responses:
   *          200:
   *            description: Resources are available
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    appSettingsParams:
   *                      type: object
   *                      description: app settings params
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
      region: crowi.configManager.getConfig('crowi', 'aws:region'),
      customEndpoint: crowi.configManager.getConfig('crowi', 'aws:customEndpoint'),
      bucket: crowi.configManager.getConfig('crowi', 'aws:bucket'),
      accessKeyId: crowi.configManager.getConfig('crowi', 'aws:accessKeyId'),
      secretAccessKey: crowi.configManager.getConfig('crowi', 'aws:secretAccessKey'),
      isEnabledPlugins: crowi.configManager.getConfig('crowi', 'plugin:isEnabledPlugins'),
    };
    return res.apiv3({ appSettingsParams });

  });


  /**
   * @swagger
   *
   *    /app-settings/app-setting:
   *      put:
   *        tags: [AppSettings]
   *        summary: /app-settings/app-setting
   *        operationId: updateAppSettings
   *        description: Update app setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/AppSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update app setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/AppSettingParams'
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
   *        operationId: updateAppSettingSiteUrlSetting
   *        summary: /app-settings/site-url-setting
   *        description: Update site url setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SiteUrlSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update site url setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/SiteUrlSettingParams'
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
   *    /app-settings/mail-setting:
   *      put:
   *        tags: [AppSettings]
   *        operationId: updateAppSettingMailSetting
   *        summary: /app-settings/site-url-setting
   *        description: Update mail setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/MailSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update mail setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/MailSettingParams'
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

  /**
   * @swagger
   *
   *    /app-settings/aws-setting:
   *      put:
   *        tags: [AppSettings]
   *        operationId: updateAppSettingAwsSetting
   *        summary: /app-settings/aws-setting
   *        description: Update aws setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/AwsSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update aws setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/AwsSettingParams'
   */
  router.put('/aws-setting', loginRequiredStrictly, adminRequired, csrf, validator.awsSetting, ApiV3FormValidator, async(req, res) => {
    const requestAwsSettingParams = {
      'aws:region': req.body.region,
      'aws:customEndpoint': req.body.customEndpoint,
      'aws:bucket': req.body.bucket,
      'aws:accessKeyId': req.body.accessKeyId,
      'aws:secretAccessKey': req.body.secretAccessKey,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestAwsSettingParams);
      const awsSettingParams = {
        region: crowi.configManager.getConfig('crowi', 'aws:region'),
        customEndpoint: crowi.configManager.getConfig('crowi', 'aws:customEndpoint'),
        bucket: crowi.configManager.getConfig('crowi', 'aws:bucket'),
        accessKeyId: crowi.configManager.getConfig('crowi', 'aws:accessKeyId'),
        secretAccessKey: crowi.configManager.getConfig('crowi', 'aws:secretAccessKey'),
      };
      return res.apiv3({ awsSettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating aws setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-awsSetting-failed'));
    }

  });

  /**
   * @swagger
   *
   *    /app-settings/plugin-setting:
   *      put:
   *        tags: [AppSettings]
   *        operationId: updateAppSettingPluginSetting
   *        summary: /app-settings/plugin-setting
   *        description: Update plugin setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/PluginSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update plugin setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/PluginSettingParams'
   */
  router.put('/plugin-setting', loginRequiredStrictly, adminRequired, csrf, validator.pluginSetting, ApiV3FormValidator, async(req, res) => {
    const requestPluginSettingParams = {
      'plugin:isEnabledPlugins': req.body.isEnabledPlugins,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestPluginSettingParams);
      const pluginSettingParams = {
        isEnabledPlugins: crowi.configManager.getConfig('crowi', 'plugin:isEnabledPlugins'),
      };
      return res.apiv3({ pluginSettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating plugin setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-pluginSetting-failed'));
    }

  });

  return router;
};
