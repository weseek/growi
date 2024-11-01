import { ErrorV3 } from '@growi/core/dist/models';
import { body } from 'express-validator';

import { i18n } from '^/config/next-i18next.config';

import { SupportedAction } from '~/interfaces/activity';
import loggerFactory from '~/utils/logger';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';


const logger = loggerFactory('growi:routes:apiv3:app-settings');

const { pathUtils } = require('@growi/core/dist/utils');
const express = require('express');

const router = express.Router();


/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      AppSettingParams:
 *        description: AppSettingParams
 *        type: object
 *        properties:
 *          azureReferenceFileWithRelayMode:
 *            type: boolean
 *            example: false
 *          azureUseOnlyEnvVars:
 *            type: boolean
 *            example: false
 *          confidential:
 *            type: string
 *            description: confidential show on page header
 *            example: 'GROWI'
 *          envAzureClientId:
 *            type: string
 *            example: 'AZURE_CLIENT_ID'
 *          envAzureClientSecret:
 *            type: string
 *            example: 'AZURE_CLIENT_SECRET'
 *          envAzureStorageAccountName:
 *           type: string
 *           example: 'AZURE_STORAGE_ACCOUNT_NAME'
 *          envAzureStorageContainerName:
 *            type: string
 *            example: 'AZURE_STORAGE_CONTAINER_NAME'
 *          envFileUploadType:
 *            type: string
 *            example: 'mongodb'
 *          envGcsApiKeyJsonPath:
 *            type: string
 *            example: 'GCS_API_KEY_JSON_PATH'
 *          envGcsBucket:
 *            type: string
 *            example: 'GCS_BUCKET'
 *          envGcsUploadNamespace:
 *            type: string
 *            example: 'GCS_UPLOAD_NAMESPACE'
 *          envSiteUrl:
 *            type: string
 *            example: 'http://localhost:3000'
 *          fileUpload:
 *            type: boolean
 *            example: true
 *          fileUploadType:
 *            type: string
 *            example: 'local'
 *          fromAddress:
 *            type: string
 *            example: info@growi.org
 *          gcsApiKeyJsonPath:
 *            type: string
 *            example: 'GCS_API_KEY_JSON_PATH'
 *          gcsBucket:
 *            type: string
 *            example: 'GCS_BUCKET'
 *          gcsReferenceFileWithRelayMode:
 *            type: boolean
 *            example: false
 *          gcsUploadNamespace:
 *            type: string
 *            example: 'GCS_UPLOAD_NAMESPACE'
 *          gcsUseOnlyEnvVars:
 *            type: boolean
 *            example: false
 *          globalLang:
 *            type: string
 *            example: 'ja_JP'
 *          isAppSiteUrlHashed:
 *            type: boolean
 *            example: false
 *          isEmailPublishedForNewUser:
 *            type: boolean
 *            example: true
 *          isMaintenanceMode:
 *            type: boolean
 *            example: false
 *          isQuestionnaireEnabled:
 *            type: boolean
 *            example: true
 *          isV5Compatible:
 *            type: boolean
 *            example: true
 *          s3AccessKeyId:
 *            type: string
 *          s3Bucket:
 *            type: string
 *          s3CustomEndpoint:
 *            type: string
 *          s3ReferenceFileWithRelayMode:
 *            type: boolean
 *          s3Region:
 *            type: string
 *          siteUrl:
 *            type: string
 *          siteUrlUseOnlyEnvVars:
 *            type: boolean
 *          smtpHost:
 *            type: string
 *          smtpPassword:
 *            type: string
 *          smtpPort:
 *            type: string
 *          smtpUser:
 *            type: string
 *          useOnlyEnvVarForFileUploadType:
 *            type: boolean
 *      AppSettingPutParams:
 *        description: AppSettingPutParams
 *        type: object
 *        properties:
 *          title:
 *            type: string
 *            description: title of the site
 *            example: 'GROWI'
 *          confidential:
 *            type: string
 *            description: confidential show on page header
 *            example: 'GROWI'
 *          globalLang:
 *            type: string
 *            description: global language
 *            example: 'ja_JP'
 *          isEmailPublishedForNewUser:
 *            type: boolean
 *            description: is email published for new user, or not
 *            example: true
 *          fileUpload:
 *            type: boolean
 *            description: is file upload enabled, or not
 *            example: true
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
 *      SmtpSettingParams:
 *        description: SmtpSettingParams
 *        type: object
 *        properties:
 *          smtpHost:
 *            type: string
 *            description: host name of client's smtp server
 *            example: 'smtp.example.com'
 *          smtpPort:
 *            type: string
 *            description: port of client's smtp server
 *            example: '587'
 *          smtpUser:
 *            type: string
 *            description: user name of client's smtp server
 *            example: 'USER'
 *          smtpPassword:
 *            type: string
 *            description: password of client's smtp server
 *            example: 'PASSWORD'
 *          fromAddress:
 *            type: string
 *            description: e-mail address
 *            example: 'info@example.com'
 *      SmtpSettingResponseParams:
 *        description: SmtpSettingResponseParams
 *        type: object
 *        properties:
 *          isMailerSetup:
 *            type: boolean
 *            description: is mailer setup, or not
 *            example: true
 *          smtpHost:
 *            type: string
 *            description: host name of client's smtp server
 *            example: 'smtp.example.com'
 *          smtpPort:
 *            type: string
 *            description: port of client's smtp server
 *            example: '587'
 *          smtpUser:
 *            type: string
 *            description: user name of client's smtp server
 *            example: 'USER'
 *          smtpPassword:
 *            type: string
 *            description: password of client's smtp server
 *            example: 'PASSWORD'
 *          fromAddress:
 *            type: string
 *            description: e-mail address
 *            example: 'info@example.com'
 *      SesSettingParams:
 *        description: SesSettingParams
 *        type: object
 *        properties:
 *          from:
 *            type: string
 *            description: e-mail address used as from address of mail which sent from GROWI app
 *            example: 'info@growi.org'
 *          transmissionMethod:
 *            type: string
 *            description: transmission method
 *            example: 'ses'
 *          sesAccessKeyId:
 *            type: string
 *            description: accesskey id for authentification of AWS
 *          sesSecretAccessKey:
 *            type: string
 *            description: secret key for authentification of AWS
 *      SesSettingResponseParams:
 *        description: SesSettingParams
 *        type: object
 *        properties:
 *          isMailerSetup:
 *            type: boolean
 *            description: is mailer setup, or not
 *            example: true
 *          from:
 *            type: string
 *            description: e-mail address used as from address of mail which sent from GROWI app
 *            example: 'info@growi.org'
 *          transmissionMethod:
 *            type: string
 *            description: transmission method
 *            example: 'ses'
 *          sesAccessKeyId:
 *            type: string
 *            description: accesskey id for authentification of AWS
 *          sesSecretAccessKey:
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
 *          azureTenantId:
 *            type: string
 *            description: tenant id of azure
 *          azureClientId:
 *            type: string
 *            description: client id of azure
 *          azureClientSecret:
 *            type: string
 *            description: client secret of azure
 *          azureStorageAccountName:
 *            type: string
 *            description: storage account name of azure
 *          azureStorageContainerName:
 *            type: string
 *            description: storage container name of azure
 *          azureReferenceFileWithRelayMode:
 *            type: boolean
 *            description: is enable internal stream system for azure file request
 *      QuestionnaireSettingParams:
 *        description: QuestionnaireSettingParams
 *        type: object
 *        properties:
 *          isQuestionnaireEnabled:
 *            type: boolean
 *            description: is questionnaire enabled, or not
 *            example: true
 *          isAppSiteUrlHashed:
 *            type: boolean
 *            description: is app site url hashed, or not
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const addActivity = generateAddActivityMiddleware(crowi);

  const activityEvent = crowi.event('activity');

  const validator = {
    appSetting: [
      body('title').trim(),
      body('confidential'),
      body('globalLang').isIn(i18n.locales),
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
      body('fileUploadType').isIn(['aws', 'gcs', 'local', 'gridfs', 'azure']),
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
      body('azureTenantId').trim(),
      body('azureClientId').trim(),
      body('azureClientSecret').trim(),
      body('azureStorageAccountName').trim(),
      body('azureStorageStorageName').trim(),
      body('azureReferenceFileWithRelayMode').if(value => value != null).isBoolean(),

    ],
    questionnaireSettings: [
      body('isQuestionnaireEnabled').isBoolean(),
      body('isAppSiteUrlHashed').isBoolean(),
    ],
    maintenanceMode: [
      body('flag').isBoolean(),
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
   *                      $ref: '#/components/schemas/AppSettingParams'
   */
  router.get('/', accessTokenParser, loginRequiredStrictly, adminRequired, async(req, res) => {
    const appSettingsParams = {
      title: crowi.configManager.getConfig('crowi', 'app:title'),
      confidential: crowi.configManager.getConfig('crowi', 'app:confidential'),
      globalLang: crowi.configManager.getConfig('crowi', 'app:globalLang'),
      isEmailPublishedForNewUser: crowi.configManager.getConfig('crowi', 'customize:isEmailPublishedForNewUser'),
      fileUpload: crowi.configManager.getConfig('crowi', 'app:fileUpload'),
      isV5Compatible: crowi.configManager.getConfig('crowi', 'app:isV5Compatible'),
      siteUrl: crowi.configManager.getConfig('crowi', 'app:siteUrl'),
      siteUrlUseOnlyEnvVars: crowi.configManager.getConfig('crowi', 'app:siteUrl:useOnlyEnvVars'),
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
      s3ReferenceFileWithRelayMode: crowi.configManager.getConfig('crowi', 'aws:referenceFileWithRelayMode'),

      gcsUseOnlyEnvVars: crowi.configManager.getConfig('crowi', 'gcs:useOnlyEnvVarsForSomeOptions'),
      gcsApiKeyJsonPath: crowi.configManager.getConfig('crowi', 'gcs:apiKeyJsonPath'),
      gcsBucket: crowi.configManager.getConfig('crowi', 'gcs:bucket'),
      gcsUploadNamespace: crowi.configManager.getConfig('crowi', 'gcs:uploadNamespace'),
      gcsReferenceFileWithRelayMode: crowi.configManager.getConfig('crowi', 'gcs:referenceFileWithRelayMode'),

      envGcsApiKeyJsonPath: crowi.configManager.getConfigFromEnvVars('crowi', 'gcs:apiKeyJsonPath'),
      envGcsBucket: crowi.configManager.getConfigFromEnvVars('crowi', 'gcs:bucket'),
      envGcsUploadNamespace: crowi.configManager.getConfigFromEnvVars('crowi', 'gcs:uploadNamespace'),

      azureUseOnlyEnvVars: crowi.configManager.getConfig('crowi', 'azure:useOnlyEnvVarsForSomeOptions'),
      azureTenantId: crowi.configManager.getConfigFromDB('crowi', 'azure:tenantId'),
      azureClientId: crowi.configManager.getConfigFromDB('crowi', 'azure:clientId'),
      azureClientSecret: crowi.configManager.getConfigFromDB('crowi', 'azure:clientSecret'),
      azureStorageAccountName: crowi.configManager.getConfigFromDB('crowi', 'azure:storageAccountName'),
      azureStorageContainerName: crowi.configManager.getConfigFromDB('crowi', 'azure:storageContainerName'),
      azureReferenceFileWithRelayMode: crowi.configManager.getConfig('crowi', 'azure:referenceFileWithRelayMode'),

      envAzureTenantId: crowi.configManager.getConfigFromEnvVars('crowi', 'azure:tenantId'),
      envAzureClientId: crowi.configManager.getConfigFromEnvVars('crowi', 'azure:clientId'),
      envAzureClientSecret: crowi.configManager.getConfigFromEnvVars('crowi', 'azure:clientSecret'),
      envAzureStorageAccountName: crowi.configManager.getConfigFromEnvVars('crowi', 'azure:storageAccountName'),
      envAzureStorageContainerName: crowi.configManager.getConfigFromEnvVars('crowi', 'azure:storageContainerName'),

      isEnabledPlugins: crowi.configManager.getConfig('crowi', 'plugin:isEnabledPlugins'),

      isQuestionnaireEnabled: crowi.configManager.getConfig('crowi', 'questionnaire:isQuestionnaireEnabled'),
      isAppSiteUrlHashed: crowi.configManager.getConfig('crowi', 'questionnaire:isAppSiteUrlHashed'),

      isMaintenanceMode: crowi.configManager.getConfig('crowi', 'app:isMaintenanceMode'),
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
   *                $ref: '#/components/schemas/AppSettingPutParams'
   *        responses:
   *          200:
   *            description: Succeeded to update app setting
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    appSettingParams:
   *                      type: object
   *                      $ref: '#/components/schemas/AppSettingPutParams'
   */
  router.put('/app-setting', loginRequiredStrictly, adminRequired, addActivity, validator.appSetting, apiV3FormValidator, async(req, res) => {
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

      const parameters = { action: SupportedAction.ACTION_ADMIN_APP_SETTINGS_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);

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
   *                  type: object
   *                  properties:
   *                    siteUrlSettingParams:
   *                      type: object
   *                      properties:
   *                        siteUrl:
   *                          type: string
   *                          description: Site URL. e.g. https://example.com, https://example.com:3000
   *                          example: 'http://localhost:3000'
   */
  router.put('/site-url-setting', loginRequiredStrictly, adminRequired, addActivity, validator.siteUrlSetting, apiV3FormValidator, async(req, res) => {

    const useOnlyEnvVars = crowi.configManager.getConfig('crowi', 'app:siteUrl:useOnlyEnvVars');

    if (useOnlyEnvVars) {
      const msg = 'Updating the Site URL is prohibited on this system.';
      return res.apiv3Err(new ErrorV3(msg, 'update-siteUrlSetting-prohibited'));
    }

    const requestSiteUrlSettingParams = {
      'app:siteUrl': pathUtils.removeTrailingSlash(req.body.siteUrl),
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestSiteUrlSettingParams);
      const siteUrlSettingParams = {
        siteUrl: crowi.configManager.getConfig('crowi', 'app:siteUrl'),
      };

      const parameters = { action: SupportedAction.ACTION_ADMIN_SITE_URL_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
    logger.debug('mailer setup for validate SMTP setting', smtpClient);

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
   *                  type: object
   *                  properties:
   *                    mailSettingParams:
   *                      type: object
   *                      $ref: '#/components/schemas/SmtpSettingResponseParams'
   */
  router.put('/smtp-setting', loginRequiredStrictly, adminRequired, addActivity, validator.smtpSetting, apiV3FormValidator, async(req, res) => {
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
      const parameters = { action: SupportedAction.ACTION_ADMIN_MAIL_SMTP_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  description: Empty object
   */
  router.post('/smtp-test', loginRequiredStrictly, adminRequired, addActivity, async(req, res) => {
    try {
      await sendTestEmail(req.user.email);
      const parameters = { action: SupportedAction.ACTION_ADMIN_MAIL_TEST_SUBMIT };
      activityEvent.emit('update', res.locals.activity._id, parameters);
      return res.apiv3({});
    }
    catch (err) {
      const msg = req.t('validation.failed_to_send_a_test_email');
      logger.error('Error', err);
      logger.debug('Error validate mail setting: ', err);
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
   *                  $ref: '#/components/schemas/SesSettingResponseParams'
   */
  router.put('/ses-setting', loginRequiredStrictly, adminRequired, addActivity, validator.sesSetting, apiV3FormValidator, async(req, res) => {
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
    const parameters = { action: SupportedAction.ACTION_ADMIN_MAIL_SES_UPDATE };
    activityEvent.emit('update', res.locals.activity._id, parameters);
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
   *                  type: object
   *                  properties:
   *                    responseParams:
   *                      type: object
   *                      $ref: '#/components/schemas/FileUploadSettingParams'
   */
  //  eslint-disable-next-line max-len
  router.put('/file-upload-setting', loginRequiredStrictly, adminRequired, addActivity, validator.fileUploadSetting, apiV3FormValidator, async(req, res) => {
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
      requestParams['aws:referenceFileWithRelayMode'] = req.body.s3ReferenceFileWithRelayMode;
    }

    if (fileUploadType === 'azure') {
      requestParams['azure:tenantId'] = req.body.azureTenantId;
      requestParams['azure:clientId'] = req.body.azureClientId;
      requestParams['azure:clientSecret'] = req.body.azureClientSecret;
      requestParams['azure:storageAccountName'] = req.body.azureStorageAccountName;
      requestParams['azure:storageContainerName'] = req.body.azureStorageContainerName;
      requestParams['azure:referenceFileWithRelayMode'] = req.body.azureReferenceFileWithRelayMode;
    }

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams, true);

      const s3SecretAccessKey = req.body.s3SecretAccessKey;
      if (fileUploadType === 'aws' && s3SecretAccessKey != null && s3SecretAccessKey.trim() !== '') {
        await crowi.configManager.updateConfigsInTheSameNamespace('crowi', { 'aws:s3SecretAccessKey': s3SecretAccessKey }, true);
      }

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
        responseParams.s3ReferenceFileWithRelayMode = crowi.configManager.getConfig('crowi', 'aws:referenceFileWithRelayMode');
      }

      if (fileUploadType === 'azure') {
        responseParams.azureTenantId = crowi.configManager.getConfig('crowi', 'azure:tenantId');
        responseParams.azureClientId = crowi.configManager.getConfig('crowi', 'azure:clientId');
        responseParams.azureClientSecret = crowi.configManager.getConfig('crowi', 'azure:clientSecret');
        responseParams.azureStorageAccountName = crowi.configManager.getConfig('crowi', 'azure:storageAccountName');
        responseParams.azureStorageContainerName = crowi.configManager.getConfig('crowi', 'azure:storageContainerName');
        responseParams.azureReferenceFileWithRelayMode = crowi.configManager.getConfig('crowi', 'azure:referenceFileWithRelayMode');
      }
      const parameters = { action: SupportedAction.ACTION_ADMIN_FILE_UPLOAD_CONFIG_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
   *    /app-settings/questionnaire-settings:
   *      put:
   *        tags: [AppSettings]
   *        operationId: updateAppSettingQuestionnaireSettings
   *        summary: /app-settings/questionnaire-settings
   *        description: Update QuestionnaireSetting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/QuestionnaireSettingParams'
   *        responses:
   *          200:
   *            description: Succeeded to update QuestionnaireSetting
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    responseParams:
   *                      type: object
   *                      $ref: '#/components/schemas/QuestionnaireSettingParams'
   */
  // eslint-disable-next-line max-len
  router.put('/questionnaire-settings', loginRequiredStrictly, adminRequired, addActivity, validator.questionnaireSettings, apiV3FormValidator, async(req, res) => {
    const { isQuestionnaireEnabled, isAppSiteUrlHashed } = req.body;

    const requestParams = {
      'questionnaire:isQuestionnaireEnabled': isQuestionnaireEnabled,
      'questionnaire:isAppSiteUrlHashed': isAppSiteUrlHashed,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams, true);

      const responseParams = {
        isQuestionnaireEnabled: crowi.configManager.getConfig('crowi', 'questionnaire:isQuestionnaireEnabled'),
        isAppSiteUrlHashed: crowi.configManager.getConfig('crowi', 'questionnaire:isAppSiteUrlHashed'),
      };

      const parameters = { action: SupportedAction.ACTION_ADMIN_QUESTIONNAIRE_SETTINGS_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
      return res.apiv3({ responseParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating questionnaire settings';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-questionnaire-settings-failed'));
    }

  });

  /**
   * @swagger
   *
   *    /app-settings/v5-schema-migration:
   *      post:
   *        tags: [AppSettings]
   *        operationId: updateAppSettingV5SchemaMigration
   *        summary: AccessToken supported.
   *        description: Update V5SchemaMigration
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *        responses:
   *          200:
   *            description: Succeeded to get V5SchemaMigration
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    isV5Compatible:
   *                      type: boolean
   *                      description: is V5 compatible, or not
   *                      example: true
   */
  router.post('/v5-schema-migration', accessTokenParser, loginRequiredStrictly, adminRequired, async(req, res) => {
    const isMaintenanceMode = crowi.appService.isMaintenanceMode();
    if (!isMaintenanceMode) {
      return res.apiv3Err(new ErrorV3('GROWI is not maintenance mode. To import data, please activate the maintenance mode first.', 'not_maintenance_mode'));
    }

    const isV5Compatible = crowi.configManager.getConfig('crowi', 'app:isV5Compatible');

    try {
      if (!isV5Compatible) {
        // This method throws and emit socketIo event when error occurs
        crowi.pageService.normalizeAllPublicPages();
      }
    }
    catch (err) {
      return res.apiv3Err(new ErrorV3(`Failed to migrate pages: ${err.message}`), 500);
    }

    return res.apiv3({ isV5Compatible });
  });

  /**
   * @swagger
   *
   *    /app-settings/maintenance-mode:
   *      post:
   *        tags: [AppSettings]
   *        operationId: updateAppSettingMaintenanceMode
   *        summary: AccessToken supported.
   *        description: Update MaintenanceMode
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  flag:
   *                    type: boolean
   *                    description: flag for maintenance mode
   *        responses:
   *          200:
   *            description: Succeeded to update MaintenanceMode
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    flag:
   *                      type: boolean
   *                      description: true if maintenance mode is enabled
   *                      example: true
   */
  // eslint-disable-next-line max-len
  router.post('/maintenance-mode', accessTokenParser, loginRequiredStrictly, adminRequired, addActivity, validator.maintenanceMode, apiV3FormValidator, async(req, res) => {
    const { flag } = req.body;
    const parameters = {};
    try {
      if (flag) {
        await crowi.appService.startMaintenanceMode();
        Object.assign(parameters, { action: SupportedAction.ACTION_ADMIN_MAINTENANCEMODE_ENABLED });
      }
      else {
        await crowi.appService.endMaintenanceMode();
        Object.assign(parameters, { action: SupportedAction.ACTION_ADMIN_MAINTENANCEMODE_DISABLED });
      }
    }
    catch (err) {
      logger.error(err);
      if (flag) {
        res.apiv3Err(new ErrorV3('Failed to start maintenance mode', 'failed_to_start_maintenance_mode'), 500);
      }
      else {
        res.apiv3Err(new ErrorV3('Failed to end maintenance mode', 'failed_to_end_maintenance_mode'), 500);
      }
    }

    if ('action' in parameters) {
      activityEvent.emit('update', res.locals.activity._id, parameters);
    }

    res.apiv3({ flag });
  });

  return router;
};
