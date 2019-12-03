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
};


/**
 * @swagger
 *  tags:
 *    name: AppSetting
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
 */

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { ApiV3FormValidator } = crowi.middlewares;


  /**
   * @swagger
   *
   *    /app-setting/lineBreak:
   *      put:
   *        tags: [AppSetting]
   *        description: Update lineBreak setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  isEnabledLinebreaks:
   *                    description: enable lineBreak
   *                    type: boolean
   *                  isEnabledLinebreaksInComments:
   *                    description: enable lineBreak in comment
   *                    type: boolean
   *        responses:
   *          200:
   *            description: Succeeded to update lineBreak setting
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    status:
   *                      $ref: '#/components/schemas/LineBreakParams'
   */
  router.put('/appSetting', loginRequiredStrictly, adminRequired, csrf, validator.appSetting, ApiV3FormValidator, async(req, res) => {

    const requestAppSettingParams = {
      'app:title': req.body.title,
      'app:confidential': req.body.confidential,
      'app:globalLang': req.body.globalLang,
      'app:fileUpload': req.body.fileUpload,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('app', requestAppSettingParams);
      const appSettingParams = {
        title: await crowi.configManager.getConfig('app', 'app:title'),
        confidential: await crowi.configManager.getConfig('app', 'app:confidenaial'),
        globalLang: await crowi.configManager.getConfig('app', 'app:globalLang'),
        fileUpload: await crowi.configManager.getConfig('app', 'app:fileUpload'),
      };
      return res.apiv3({ appSettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating app setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-appSetting-failed'));
    }

  });


  return router;
};
