const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:app-settings');

const debug = require('debug')('growi:routes:admin');

const express = require('express');

const { listLocaleIds } = require('@commons/util/locale-utils');

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
 *      FromAddress:
 *        description: MailSettingParams
 *        type: object
 *        properties:
 *          fromAddress:
 *            type: string
 *            description: e-mail address used as from address of mail which sent from GROWI app
 *      SmtpSettingParams:
 *        description: SmtpSettingParams
 *        type: object
 *        properties:
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
 *      SesSettingParams:
 *        description: SesSettingParams
 *        type: object
 *        properties:
 *          accessKeyId:
 *            type: string
 *            description: accesskey id for authentification of AWS
 *          secretAccessKey:
 *            type: string
 *            description: secret key for authentification of AWS
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
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const validator = {
    appSetting: [
      body('title').trim(),
      body('confidential'),
      body('globalLang').isIn(listLocaleIds()),
      body('fileUpload').isBoolean(),
    ],
    siteUrlSetting: [
      body('siteUrl').trim().matches(/^(https?:\/\/[^/]+|)$/).isURL({ require_tld: false }),
    ],
    fromAddress: [
      body('fromAddress').trim().if(value => value !== '').isEmail(),
    ],
    smtpSetting: [
      body('smtpHost').trim(),
      body('smtpPort').trim().if(value => value !== '').isPort(),
      body('smtpUser').trim(),
      body('smtpPassword').trim(),
    ],
    sesSetting: [
      body('sesAccessKeyId').trim().if(value => value !== '').matches(/^[\da-zA-Z]+$/),
      body('sesSecretAccessKey').trim(),
    ],
    awsSetting: [
      body('region').trim().matches(/^[a-z]+-[a-z]+-\d+$/).withMessage((value, { req }) => req.t('validation.aws_region')),
      body('customEndpoint').trim().matches(/^(https?:\/\/[^/]+|)$/).withMessage((value, { req }) => req.t('validation.aws_custom_endpoint')),
      body('bucket').trim(),
      body('accessKeyId').trim().if(value => value !== '').matches(/^[\da-zA-Z]+$/),
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
      sesAccessKeyId: crowi.configManager.getConfig('crowi', 'mail:sesAccessKeyId'),
      sesSecretAccessKey: crowi.configManager.getConfig('crowi', 'mail:sesSecretAccessKey'),
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
  router.put('/app-setting', loginRequiredStrictly, adminRequired, csrf, validator.appSetting, apiV3FormValidator, async(req, res) => {
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
  router.put('/site-url-setting', loginRequiredStrictly, adminRequired, csrf, validator.siteUrlSetting, apiV3FormValidator, async(req, res) => {

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
  async function sendTestEmail(req) {

    const { configManager, mailService } = crowi;

    if (!mailService.isMailerSetup) {
      throw Error('mailService is not setup');
    }

    const fromAddress = configManager.getConfig('crowi', 'mail:from');
    if (fromAddress == null) {
      throw Error('fromAddress is not setup');
    }

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

    const smtpClient = mailService.createSMTPClient(option);
    debug('mailer setup for validate SMTP setting', smtpClient);

    const mailOptions = {
      from: fromAddress,
      to: req.user.email,
      subject: 'Wiki管理設定のアップデートによるメール通知',
      text: 'このメールは、WikiのSMTP設定のアップデートにより送信されています。',
    };

    await sendMailPromiseWrapper(smtpClient, mailOptions);
  }

  const updateMailSettinConfig = async function(requestMailSettingParams) {
    const {
      configManager,
      mailService,
    } = crowi;

    // update config without publishing S2sMessage
    await configManager.updateConfigsInTheSameNamespace('crowi', requestMailSettingParams, true);

    await mailService.initialize();
    mailService.publishUpdatedMessage();

    return {
      isMailerSetup: mailService.isMailerSetup,
      smtpHost: configManager.getConfig('crowi', 'mail:smtpHost'),
      smtpPort: configManager.getConfig('crowi', 'mail:smtpPort'),
      smtpUser: configManager.getConfig('crowi', 'mail:smtpUser'),
      smtpPassword: configManager.getConfig('crowi', 'mail:smtpPassword'),
    };
  };

  /**
   * @swagger
   *
   *    /app-settings/from-address:
   *      put:
   *        tags: [AppSettings]
   *        operationId: updateAppSettingFromAddress
   *        summary: /app-settings/from-address
   *        description: Update from address
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/FromAddress'
   *        responses:
   *          200:
   *            description: Succeeded to update from adress
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/FromAddress'
   */
  router.put('/from-address', loginRequiredStrictly, adminRequired, csrf, validator.fromAddress, apiV3FormValidator, async(req, res) => {

    try {
      const mailSettingParams = await updateMailSettinConfig({ 'mail:from': req.body.fromAddress });
      return res.apiv3({ mailSettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating from adress';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-from-adress-failed'));
    }

  });

  /**
   * @swagger
   *
   *    /app-settings/smtp-setting:
   *      put:
   *        tags: [AppSettings]
   *        operationId: updateAppSettingSmtpSetting
   *        summary: /app-settings/smtp-setting
   *        description: Update smtp setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SmtpSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update smtp setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/SmtpSettingParams'
   */
  router.put('/smtp-setting', loginRequiredStrictly, adminRequired, csrf, validator.smtpSetting, apiV3FormValidator, async(req, res) => {
    const requestMailSettingParams = {
      'mail:smtpHost': req.body.smtpHost,
      'mail:smtpPort': req.body.smtpPort,
      'mail:smtpUser': req.body.smtpUser,
      'mail:smtpPassword': req.body.smtpPassword,
    };

    try {
      const mailSettingParams = await updateMailSettinConfig(requestMailSettingParams);
      return res.apiv3({ mailSettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating smtp setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-smtpSetting-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /app-settings/smtp-test:
   *      post:
   *        tags: [AppSettings]
   *        operationId: posyAppSettingSmtpTast
   *        summary: /app-settings/smtp-setting
   *        description: Send test mail for smtp
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SmtpSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to send test mail for smtp
   */
  router.post('/smtp-test', loginRequiredStrictly, adminRequired, csrf, validator.smtpSetting, apiV3FormValidator, async(req, res) => {
    try {
      await sendTestEmail(req);
      return res.apiv3({});
    }
    catch (err) {
      const msg = req.t('validation.failed_to_send_a_test_email');
      logger.error('Error', err);
      debug('Error validate mail setting: ', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-mailSetting-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /app-settings/ses-setting:
   *      put:
   *        tags: [AppSettings]
   *        operationId: updateAppSettingSesSetting
   *        summary: /app-settings/ses-setting
   *        description: Update ses setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SesSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update ses setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/SesSettingParams'
   */
  router.put('/ses-setting', loginRequiredStrictly, adminRequired, csrf, validator.sesSetting, apiV3FormValidator, async(req, res) => {

    const requestSesSettingParams = {
      'mail:sesAccessKeyId': req.body.sesAccessKeyId,
      'mail:sesSecretAccessKey': req.body.sesSecretAccessKey,
    };

    try {
      const mailSettingParams = await updateMailSettinConfig(requestSesSettingParams);
      return res.apiv3({ mailSettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating ses setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-ses-setting-failed'));
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
  router.put('/aws-setting', loginRequiredStrictly, adminRequired, csrf, validator.awsSetting, apiV3FormValidator, async(req, res) => {
    const requestAwsSettingParams = {
      'aws:region': req.body.region,
      'aws:customEndpoint': req.body.customEndpoint,
      'aws:bucket': req.body.bucket,
      'aws:accessKeyId': req.body.accessKeyId,
      'aws:secretAccessKey': req.body.secretAccessKey,
    };

    try {
      const { configManager, mailService } = crowi;

      // update config without publishing S2sMessage
      await configManager.updateConfigsInTheSameNamespace('crowi', requestAwsSettingParams, true);

      await mailService.initialize();
      mailService.publishUpdatedMessage();

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
  router.put('/plugin-setting', loginRequiredStrictly, adminRequired, csrf, validator.pluginSetting, apiV3FormValidator, async(req, res) => {
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
