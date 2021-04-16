import loggerFactory from '~/utils/logger';
import { config as i18nConfig } from '~/i18n';

const logger = loggerFactory('growi:routes:apiv3:app-settings');

const debug = require('debug')('growi:routes:admin');

const express = require('express');

const { pathUtils } = require('growi-commons');

const router = express.Router();

const { body } = require('express-validator');
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
 *          isEmailPublishedForNewUser:
 *            type: boolean
 *            description: default email show/hide setting when create user
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
 *      MailSetting:
 *        description: MailSettingParams
 *        type: object
 *        properties:
 *          fromAddress:
 *            type: string
 *            description: e-mail address used as from address of mail which sent from GROWI app
 *          transmissionMethod:
 *            type: string
 *            description: transmission method
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
 *      FileUploadSettingParams:
 *        description: FileUploadTypeParams
 *        type: object
 *        properties:
 *          fileUploadType:
 *            type: string
 *            description: fileUploadType
 *          s3Region:
 *            type: string
 *            description: region of AWS S3
 *          s3CustomEndpoint:
 *            type: string
 *            description: custom endpoint of AWS S3
 *          s3Bucket:
 *            type: string
 *            description: AWS S3 bucket name
 *          s3AccessKeyId:
 *            type: string
 *            description: accesskey id for authentification of AWS
 *          s3SecretAccessKey:
 *            type: string
 *            description: secret key for authentification of AWS
 *          s3ReferenceFileWithRelayMode:
 *            type: boolean
 *            description: is enable internal stream system for s3 file request
 *          gcsApiKeyJsonPath:
 *            type: string
 *            description: apiKeyJsonPath of gcp
 *          gcsBucket:
 *            type: string
 *            description: bucket name of gcs
 *          gcsUploadNamespace:
 *            type: string
 *            description: name space of gcs
 *          gcsReferenceFileWithRelayMode:
 *            type: boolean
 *            description: is enable internal stream system for gcs file request
 *          envGcsApiKeyJsonPath:
 *            type: string
 *            description: Path of the JSON file that contains service account key to authenticate to GCP API
 *          envGcsBucket:
 *            type: string
 *            description: Name of the GCS bucket
 *          envGcsUploadNamespace:
 *            type: string
 *            description: Directory name to create in the bucket
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
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const validator = {
    appSetting: [
      body('title').trim(),
      body('confidential'),
      body('globalLang').isIn(i18nConfig.allLanguages),
      body('isEmailPublishedForNewUser').isBoolean(),
      body('fileUpload').isBoolean(),
    ],
    siteUrlSetting: [
      // https://regex101.com/r/5Xef8V/1
      body('siteUrl').trim().matches(/^(https?:\/\/)/).isURL({ require_tld: false }),
    ],
    mailSetting: [
      body('fromAddress').trim().if(value => value !== '').isEmail(),
      body('transmissionMethod').isIn(['smtp', 'ses']),
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
    fileUploadSetting: [
      body('fileUploadType').isIn(['aws', 'gcs', 'local', 'gridfs']),
      body('gcsApiKeyJsonPath').trim(),
      body('gcsBucket').trim(),
      body('gcsUploadNamespace').trim(),
      body('gcsReferenceFileWithRelayMode').if(value => value != null).isBoolean(),
      body('s3Region').trim().if(value => value !== '').matches(/^[a-z]+-[a-z]+-\d+$/)
        .withMessage((value, { req }) => req.t('validation.aws_region')),
      body('s3CustomEndpoint').trim().if(value => value !== '').matches(/^(https?:\/\/[^/]+|)$/)
        .withMessage((value, { req }) => req.t('validation.aws_custom_endpoint')),
      body('s3Bucket').trim(),
      body('s3AccessKeyId').trim().if(value => value !== '').matches(/^[\da-zA-Z]+$/),
      body('s3SecretAccessKey').trim(),
      body('s3ReferenceFileWithRelayMode').if(value => value != null).isBoolean(),
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
  router.get('/', accessTokenParser, loginRequiredStrictly, adminRequired, async(req, res) => {
    const appSettingsParams = {
      title: crowi.configManager.getConfig('crowi', 'app:title'),
      confidential: crowi.configManager.getConfig('crowi', 'app:confidential'),
      globalLang: crowi.configManager.getConfig('crowi', 'app:globalLang'),
      isEmailPublishedForNewUser: crowi.configManager.getConfig('crowi', 'customize:isEmailPublishedForNewUser'),
      fileUpload: crowi.configManager.getConfig('crowi', 'app:fileUpload'),
      siteUrl: crowi.configManager.getConfig('crowi', 'app:siteUrl'),
      envSiteUrl: crowi.configManager.getConfigFromEnvVars('crowi', 'app:siteUrl'),
      isMailerSetup: crowi.mailService.isMailerSetup,
      fromAddress: crowi.configManager.getConfig('crowi', 'mail:from'),

      transmissionMethod: crowi.configManager.getConfig('crowi', 'mail:transmissionMethod'),
      smtpHost: crowi.configManager.getConfig('crowi', 'mail:smtpHost'),
      smtpPort: crowi.configManager.getConfig('crowi', 'mail:smtpPort'),
      smtpUser: crowi.configManager.getConfig('crowi', 'mail:smtpUser'),
      smtpPassword: crowi.configManager.getConfig('crowi', 'mail:smtpPassword'),
      sesAccessKeyId: crowi.configManager.getConfig('crowi', 'mail:sesAccessKeyId'),
      sesSecretAccessKey: crowi.configManager.getConfig('crowi', 'mail:sesSecretAccessKey'),

      fileUploadType: crowi.configManager.getConfig('crowi', 'app:fileUploadType'),
      envFileUploadType: crowi.configManager.getConfigFromEnvVars('crowi', 'app:fileUploadType'),
      useOnlyEnvVarForFileUploadType: crowi.configManager.getConfig('crowi', 'app:useOnlyEnvVarForFileUploadType'),

      s3Region: crowi.configManager.getConfig('crowi', 'aws:s3Region'),
      s3CustomEndpoint: crowi.configManager.getConfig('crowi', 'aws:s3CustomEndpoint'),
      s3Bucket: crowi.configManager.getConfig('crowi', 'aws:s3Bucket'),
      s3AccessKeyId: crowi.configManager.getConfig('crowi', 'aws:s3AccessKeyId'),
      s3SecretAccessKey: crowi.configManager.getConfig('crowi', 'aws:s3SecretAccessKey'),
      s3ReferenceFileWithRelayMode: crowi.configManager.getConfig('crowi', 'aws:referenceFileWithRelayMode'),

      gcsUseOnlyEnvVars: crowi.configManager.getConfig('crowi', 'gcs:useOnlyEnvVarsForSomeOptions'),
      gcsApiKeyJsonPath: crowi.configManager.getConfig('crowi', 'gcs:apiKeyJsonPath'),
      gcsBucket: crowi.configManager.getConfig('crowi', 'gcs:bucket'),
      gcsUploadNamespace: crowi.configManager.getConfig('crowi', 'gcs:uploadNamespace'),
      gcsReferenceFileWithRelayMode: crowi.configManager.getConfig('crowi', 'gcs:referenceFileWithRelayMode'),

      envGcsApiKeyJsonPath: crowi.configManager.getConfigFromEnvVars('crowi', 'gcs:apiKeyJsonPath'),
      envGcsBucket: crowi.configManager.getConfigFromEnvVars('crowi', 'gcs:bucket'),
      envGcsUploadNamespace: crowi.configManager.getConfigFromEnvVars('crowi', 'gcs:uploadNamespace'),

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
  router.put('/app-setting', loginRequiredStrictly, adminRequired, validator.appSetting, apiV3FormValidator, async(req, res) => {
    const requestAppSettingParams = {
      'app:title': req.body.title,
      'app:confidential': req.body.confidential,
      'app:globalLang': req.body.globalLang,
      'customize:isEmailPublishedForNewUser': req.body.isEmailPublishedForNewUser,
      'app:fileUpload': req.body.fileUpload,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestAppSettingParams);
      const appSettingParams = {
        title: crowi.configManager.getConfig('crowi', 'app:title'),
        confidential: crowi.configManager.getConfig('crowi', 'app:confidential'),
        globalLang: crowi.configManager.getConfig('crowi', 'app:globalLang'),
        isEmailPublishedForNewUser: crowi.configManager.getConfig('crowi', 'customize:isEmailPublishedForNewUser'),
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
      'app:siteUrl': pathUtils.removeTrailingSlash(req.body.siteUrl),
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
  async function sendTestEmail(destinationAddress) {

    const { configManager, mailService } = crowi;

    if (!mailService.isMailerSetup) {
      throw Error('mailService is not setup');
    }

    const fromAddress = configManager.getConfig('crowi', 'mail:from');
    if (fromAddress == null) {
      throw Error('fromAddress is not setup');
    }

    const smtpHost = configManager.getConfig('crowi', 'mail:smtpHost');
    const smtpPort = configManager.getConfig('crowi', 'mail:smtpPort');
    const smtpUser = configManager.getConfig('crowi', 'mail:smtpUser');
    const smtpPassword = configManager.getConfig('crowi', 'mail:smtpPassword');

    const option = {
      host: smtpHost,
      port: smtpPort,
    };
    if (smtpUser && smtpPassword) {
      option.auth = {
        user: smtpUser,
        pass: smtpPassword,
      };
    }
    if (option.port === 465) {
      option.secure = true;
    }

    const smtpClient = mailService.createSMTPClient(option);
    debug('mailer setup for validate SMTP setting', smtpClient);

    const mailOptions = {
      from: fromAddress,
      to: destinationAddress,
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
      fromAddress: configManager.getConfig('crowi', 'mail:from'),
      smtpHost: configManager.getConfig('crowi', 'mail:smtpHost'),
      smtpPort: configManager.getConfig('crowi', 'mail:smtpPort'),
      smtpUser: configManager.getConfig('crowi', 'mail:smtpUser'),
      smtpPassword: configManager.getConfig('crowi', 'mail:smtpPassword'),
      sesAccessKeyId: configManager.getConfig('crowi', 'mail:sesAccessKeyId'),
      sesSecretAccessKey: configManager.getConfig('crowi', 'mail:sesSecretAccessKey'),
    };
  };

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
      'mail:from': req.body.fromAddress,
      'mail:transmissionMethod': req.body.transmissionMethod,
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
   *        operationId: postSmtpTest
   *        summary: /app-settings/smtp-setting
   *        description: Send test mail for smtp
   *        responses:
   *          200:
   *            description: Succeeded to send test mail for smtp
   */
  router.post('/smtp-test', loginRequiredStrictly, adminRequired, async(req, res) => {
    try {
      await sendTestEmail(req.user.email);
      return res.apiv3({});
    }
    catch (err) {
      const msg = req.t('validation.failed_to_send_a_test_email');
      logger.error('Error', err);
      debug('Error validate mail setting: ', err);
      return res.apiv3Err(new ErrorV3(msg, 'send-email-with-smtp-failed'));
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
    const { mailService } = crowi;

    const requestSesSettingParams = {
      'mail:from': req.body.fromAddress,
      'mail:transmissionMethod': req.body.transmissionMethod,
      'mail:sesAccessKeyId': req.body.sesAccessKeyId,
      'mail:sesSecretAccessKey': req.body.sesSecretAccessKey,
    };

    let mailSettingParams;
    try {
      mailSettingParams = await updateMailSettinConfig(requestSesSettingParams);
    }
    catch (err) {
      const msg = 'Error occurred in updating ses setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-ses-setting-failed'));
    }

    await mailService.initialize();
    mailService.publishUpdatedMessage();

    return res.apiv3({ mailSettingParams });
  });

  /**
   * @swagger
   *
   *    /app-settings/file-upload-settings:
   *      put:
   *        tags: [AppSettings]
   *        operationId: updateAppSettingFileUploadSetting
   *        summary: /app-settings/file-upload-setting
   *        description: Update fileUploadSetting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/FileUploadSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update fileUploadSetting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/FileUploadSettingParams'
   */
  router.put('/file-upload-setting', loginRequiredStrictly, adminRequired, csrf, validator.fileUploadSetting, apiV3FormValidator, async(req, res) => {
    const { fileUploadType } = req.body;

    const requestParams = {
      'app:fileUploadType': fileUploadType,
    };

    if (fileUploadType === 'gcs') {
      requestParams['gcs:apiKeyJsonPath'] = req.body.gcsApiKeyJsonPath;
      requestParams['gcs:bucket'] = req.body.gcsBucket;
      requestParams['gcs:uploadNamespace'] = req.body.gcsUploadNamespace;
      requestParams['gcs:referenceFileWithRelayMode'] = req.body.gcsReferenceFileWithRelayMode;
    }

    if (fileUploadType === 'aws') {
      requestParams['aws:s3Region'] = req.body.s3Region;
      requestParams['aws:s3CustomEndpoint'] = req.body.s3CustomEndpoint;
      requestParams['aws:s3Bucket'] = req.body.s3Bucket;
      requestParams['aws:s3AccessKeyId'] = req.body.s3AccessKeyId;
      requestParams['aws:s3SecretAccessKey'] = req.body.s3SecretAccessKey;
      requestParams['aws:referenceFileWithRelayMode'] = req.body.s3ReferenceFileWithRelayMode;
    }

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams, true);
      await crowi.setUpFileUpload(true);
      crowi.fileUploaderSwitchService.publishUpdatedMessage();

      const responseParams = {
        fileUploadType: crowi.configManager.getConfig('crowi', 'app:fileUploadType'),
      };

      if (fileUploadType === 'gcs') {
        responseParams.gcsApiKeyJsonPath = crowi.configManager.getConfig('crowi', 'gcs:apiKeyJsonPath');
        responseParams.gcsBucket = crowi.configManager.getConfig('crowi', 'gcs:bucket');
        responseParams.gcsUploadNamespace = crowi.configManager.getConfig('crowi', 'gcs:uploadNamespace');
        responseParams.gcsReferenceFileWithRelayMode = crowi.configManager.getConfig('crowi', 'gcs:referenceFileWithRelayMode ');
      }

      if (fileUploadType === 'aws') {
        responseParams.s3Region = crowi.configManager.getConfig('crowi', 'aws:s3Region');
        responseParams.s3CustomEndpoint = crowi.configManager.getConfig('crowi', 'aws:s3CustomEndpoint');
        responseParams.s3Bucket = crowi.configManager.getConfig('crowi', 'aws:s3Bucket');
        responseParams.s3AccessKeyId = crowi.configManager.getConfig('crowi', 'aws:s3AccessKeyId');
        responseParams.s3SecretAccessKey = crowi.configManager.getConfig('crowi', 'aws:s3SecretAccessKey');
        responseParams.s3ReferenceFileWithRelayMode = crowi.configManager.getConfig('crowi', 'aws:referenceFileWithRelayMode');
      }

      return res.apiv3({ responseParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating fileUploadType';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-fileUploadType-failed'));
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
