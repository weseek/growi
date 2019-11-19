/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:customize-setting');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');
const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: CustomizeSetting
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      CustomizeStatus:
 *        type: object
 *        properties:
 *          layoutType:
 *            type: string
 *          themeType:
 *            type: string
 *          behaviorType
 *            type: string
 *          isEnabledTimeline:
 *            type: boolean
 *          isSavedStatesOfTabChanges:
 *            type: boolean
 *          isEnabledAttachTitleHeader:
 *            type: boolean
 *          recentCreatedLimit:
 *            type: number
 *          customizeHeader:
 *            type: string
 *          customizeCss:
 *            type: string
 *          customizeScript:
 *            type: string
 *          customizeScript:
 *            type: string
 */
module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { ApiV3FormValidator } = crowi.middlewares;

  // TODO GW-533 implement accurate validation
  const validator = {
    layoutTheme: [
      body('layoutType').isString(),
      body('themeType').isString(),
    ],
    behavior: [
      body('behaviorType').isString(),
    ],
    function: [
      body('isEnabledTimeline').isBoolean(),
      body('isSavedStatesOfTabChanges').isBoolean(),
      body('isEnabledAttachTitleHeader').isBoolean(),
      body('recentCreatedLimit').isInt(),
    ],
    customizeHeader: [
      body('customizeHeader').isString(),
    ],
    customizeCss: [
      body('customizeCss').isString(),
    ],
    customizeScript: [
      body('customizeScript').isString(),
    ],
  };

  // TODO GW-575 writte swagger
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {

    // TODO GW-575 return others customize settings
    return res.apiv3();
  });

  /**
   * @swagger
   *
   *    /customize-setting/layoutTheme:
   *      put:
   *        tags: [CustomizeSetting]
   *        description: Update layout and theme
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schama:
   *                type: object
   *                properties:
   *                  layoutType:
   *                    description: type of layout
   *                    type: string
   *                  themeType:
   *                    description: type of theme
   *                    type: string
   *      responses:
   *        200:
   *          description: Succeeded to update layout and theme
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  customizedParams:
   *                    $ref: '#/components/schemas/CustomizeStatus'
   */
  router.put('/layoutTheme', loginRequiredStrictly, adminRequired, csrf, validator.layoutTheme, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:layout': req.body.layoutType,
      'customize:theme': req.body.themeType,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        layoutType: await crowi.configManager.getConfig('crowi', 'customize:layout'),
        themeType: await crowi.configManager.getConfig('crowi', 'customize:theme'),
      };
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating layout and theme';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-layoutTheme-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /customize-setting/behavior:
   *      put:
   *        tags: [CustomizeSetting]
   *        description: Update behavior
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schama:
   *                type: object
   *                properties:
   *                  behaviorType:
   *                    description: type of behavior
   *                    type: string
   *      responses:
   *        200:
   *          description: Succeeded to update behavior
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  customizedParams:
   *                    $ref: '#/components/schemas/CustomizeStatus'
   */
  router.put('/behavior', loginRequiredStrictly, adminRequired, csrf, validator.behavior, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:behavior': req.body.behaviorType,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        behaviorType: await crowi.configManager.getConfig('crowi', 'customize:behavior'),
      };
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating behavior';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-behavior-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /customize-setting/function:
   *      put:
   *        tags: [CustomizeSetting]
   *        description: Update function
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schama:
   *                type: object
   *                properties:
   *                  isEnabledTimeline:
   *                    description: is enabled timeline
   *                    type: boolean
   *                  isSavedStatesOfTabChanges:
   *                    description: is saved states of tabChanges
   *                    type: boolean
   *                  isEnabledAttachTitleHeader:
   *                    description: is enabled attach titleHeader
   *                    type: boolean
   *                  recentCreatedLimit:
   *                    description: limit of recent created
   *                    type: number
   *      responses:
   *        200:
   *          description: Succeeded to update function
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  customizedParams:
   *                    $ref: '#/components/schemas/CustomizeStatus'
   */
  router.put('/function', loginRequiredStrictly, adminRequired, csrf, validator.function, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:isEnabledTimeline': req.body.isEnabledTimeline,
      'customize:isSavedStatesOfTabChanges': req.body.isSavedStatesOfTabChanges,
      'customize:isEnabledAttachTitleHeader': req.body.isEnabledAttachTitleHeader,
      'customize:showRecentCreatedNumber': req.body.recentCreatedLimit,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        isEnabledTimeline: await crowi.configManager.getConfig('crowi', 'customize:isEnabledTimeline'),
        isSavedStatesOfTabChanges: await crowi.configManager.getConfig('crowi', 'customize:isSavedStatesOfTabChanges'),
        isEnabledAttachTitleHeader: await crowi.configManager.getConfig('crowi', 'customize:isEnabledAttachTitleHeader'),
        recentCreatedLimit: await crowi.configManager.getConfig('crowi', 'customize:showRecentCreatedNumber'),
      };
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating function';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-function-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /customize-setting/customizeHeader:
   *      put:
   *        tags: [CustomizeSetting]
   *        description: Update customizeHeader
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schama:
   *                type: object
   *                properties:
   *                  customizeHeader:
   *                    description: customize header
   *                    type: string
   *      responses:
   *        200:
   *          description: Succeeded to update customize header
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  customizedParams:
   *                    $ref: '#/components/schemas/CustomizeStatus'
   */
  router.put('/customize-header', loginRequiredStrictly, adminRequired, csrf, validator.customizeHeader, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:header': req.body.customizeHeader,
    };
    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        customizeCss: await crowi.configManager.getConfig('crowi', 'customize:header'),
      };
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating customizeHeader';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-customizeHeader-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /customize-setting/customizeCss:
   *      put:
   *        tags: [CustomizeSetting]
   *        description: Update customizeCss
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schama:
   *                type: object
   *                properties:
   *                  customizeCss:
   *                    description: customize css
   *                    type: string
   *      responses:
   *        200:
   *          description: Succeeded to update customize css
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  customizedParams:
   *                    $ref: '#/components/schemas/CustomizeStatus'
   */
  router.put('/customize-css', loginRequiredStrictly, adminRequired, csrf, validator.customizeCss, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:css': req.body.customizeCss,
    };
    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        customizeCss: await crowi.configManager.getConfig('crowi', 'customize:css'),
      };
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating customizeCss';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-customizeCss-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /customize-setting/customizeScript:
   *      put:
   *        tags: [CustomizeSetting]
   *        description: Update customizeScript
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schama:
   *                type: object
   *                properties:
   *                  customizeScript:
   *                    description: customize script
   *                    type: string
   *      responses:
   *        200:
   *          description: Succeeded to update customize script
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  customizedParams:
   *                    $ref: '#/components/schemas/CustomizeStatus'
   */
  router.put('/customize-script', loginRequiredStrictly, adminRequired, csrf, validator.customizeScript, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:script': req.body.customizeScript,
    };
    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        customizeScript: await crowi.configManager.getConfig('crowi', 'customize:script'),
      };
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating customizeScript';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-customizeScript-failed'));
    }
  });

  return router;
};
