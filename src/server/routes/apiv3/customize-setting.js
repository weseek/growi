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
 *      CustomizeLayoutTheme:
 *        type: object
 *        properties:
 *          layoutType:
 *            type: string
 *          themeType:
 *            type: string
 *      CustomizeBehavior:
 *        type: object
 *        properties:
 *          behaviorType:
 *            type: string
 *      CustomizeFunction:
 *        type: object
 *        properties:
 *          isEnabledTimeline:
 *            type: boolean
 *          isSavedStatesOfTabChanges:
 *            type: boolean
 *          isEnabledAttachTitleHeader:
 *            type: boolean
 *          recentCreatedLimit:
 *            type: number
 *      CustomizeHighlight:
 *        type: object
 *        properties:
 *          styleName:
 *            type: string
 *          styleBorder:
 *            type: boolean
 *      CustomizeTitle:
 *        type: object
 *        properties:
 *          customizeTitle:
 *            type: string
 *      CustomizeHeader:
 *        type: object
 *        properties:
 *          customizeHeader:
 *            type: string
 *      CustomizeCss:
 *        type: object
 *        properties:
 *          customizeCss:
 *            type: string
 *      CustomizeScript:
 *        type: object
 *        properties:
 *          customizeScript:
 *            type: string
 */
module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);
  const { customizeService } = crowi;


  const { ApiV3FormValidator } = crowi.middlewares;

  const validator = {
    layoutTheme: [
      body('layoutType').isString().isIn(['growi', 'kibela', 'crowi']),
      body('themeType').isString().isIn([
        'default', 'nature', 'mono-blue', 'wood', 'island', 'christmas', 'antarctic', 'default-dark', 'future', 'blue-night', 'halloween',
      ]),
    ],
    behavior: [
      body('behaviorType').isString().isIn(['growi', 'crowi-plus']),
    ],
    function: [
      body('isEnabledTimeline').isBoolean(),
      body('isSavedStatesOfTabChanges').isBoolean(),
      body('isEnabledAttachTitleHeader').isBoolean(),
      body('recentCreatedLimit').isInt().isInt({ min: 1, max: 1000 }),
    ],
    customizeTitle: [
      body('customizeTitle').isString(),
    ],
    customizeHeader: [
      body('customizeHeader').isString(),
    ],
    highlight: [
      body('highlightJsStyle').isString().isIn([
        'github', 'github-gist', 'atom-one-light', 'xcode', 'vs', 'atom-one-dark', 'hybrid', 'monokai', 'tororrow-night', 'vs2015',
      ]),
      body('highlightJsStyleBorder').isBoolean(),
    ],
    customizeCss: [
      body('customizeCss').isString(),
    ],
    customizeScript: [
      body('customizeScript').isString(),
    ],
  };

  /**
   * @swagger
   *
   *    /customize-setting/:
   *      get:
   *        tags: [CustomizeSetting]
   *        description: Get customize paramaters
   *        responses:
   *          200:
   *            description: params of customize
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    customizeParams:
   *                      type: object
   *                      description: customize params
   */
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {

    const customizeParams = {
      layoutType: await crowi.configManager.getConfig('crowi', 'customize:layout'),
      themeType: await crowi.configManager.getConfig('crowi', 'customize:theme'),
      behaviorType: await crowi.configManager.getConfig('crowi', 'customize:behavior'),
      isEnabledTimeline: await crowi.configManager.getConfig('crowi', 'customize:isEnabledTimeline'),
      isSavedStatesOfTabChanges: await crowi.configManager.getConfig('crowi', 'customize:isSavedStatesOfTabChanges'),
      isEnabledAttachTitleHeader: await crowi.configManager.getConfig('crowi', 'customize:isEnabledAttachTitleHeader'),
      recentCreatedLimit: await crowi.configManager.getConfig('crowi', 'customize:showRecentCreatedNumber'),
      styleName: await crowi.configManager.getConfig('crowi', 'customize:highlightJsStyle'),
      styleBorder: await crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
      customizeTitle: await crowi.configManager.getConfig('crowi', 'customize:title'),
      customizeHeader: await crowi.configManager.getConfig('crowi', 'customize:header'),
      customizeCss: await crowi.configManager.getConfig('crowi', 'customize:header'),
      customizeScript: await crowi.configManager.getConfig('crowi', 'customize:script'),
    };

    return res.apiv3({ customizeParams });
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
   *                $ref: '#/components/schemas/CustomizeLayoutTheme'
   *      responses:
   *        200:
   *          description: Succeeded to update layout and theme
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeLayoutTheme'
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
   *                $ref: '#/components/schemas/CustomizeBehavior'
   *      responses:
   *        200:
   *          description: Succeeded to update behavior
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeBehavior'
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
   *                $ref: '#/components/schemas/CustomizeFunction'
   *      responses:
   *        200:
   *          description: Succeeded to update function
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeFunction'
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
   *    /customize-setting/highlight:
   *      put:
   *        tags: [CustomizeSetting]
   *        description: Update highlight
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schama:
   *                $ref: '#/components/schemas/CustomizeHighlight'
   *      responses:
   *        200:
   *          description: Succeeded to update highlight
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeHighlight'
   */
  router.put('/highlight', loginRequiredStrictly, adminRequired, csrf, validator.highlight, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:highlightJsStyle': req.body.highlightJsStyle,
      'customize:highlightJsStyleBorder': req.body.highlightJsStyleBorder,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        styleName: await crowi.configManager.getConfig('crowi', 'customize:highlightJsStyle'),
        styleBorder: await crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
      };
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating highlight';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-highlight-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /customize-setting/customizeTitle:
   *      put:
   *        tags: [CustomizeSetting]
   *        description: Update customizeTitle
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeTitle'
   *      responses:
   *        200:
   *          description: Succeeded to update customizeTitle
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeTitle'
   */
  router.put('/customize-title', loginRequiredStrictly, adminRequired, csrf, validator.customizeTitle, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:title': req.body.customizeTitle,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        customizeTitle: await crowi.configManager.getConfig('crowi', 'customize:title'),
      };
      customizeService.initCustomTitle();
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating customizeTitle';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-customizeTitle-failed'));
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
   *                $ref: '#/components/schemas/CustomizeHeader'
   *      responses:
   *        200:
   *          description: Succeeded to update customize header
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeHeader'
   */
  router.put('/customize-header', loginRequiredStrictly, adminRequired, csrf, validator.customizeHeader, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:header': req.body.customizeHeader,
    };
    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        customizeHeader: await crowi.configManager.getConfig('crowi', 'customize:header'),
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
   *                $ref: '#/components/schemas/CustomizeCss'
   *      responses:
   *        200:
   *          description: Succeeded to update customize css
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeCss'
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
      customizeService.initCustomCss();
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
   *                $ref: '#/components/schemas/CustomizeScript'
   *      responses:
   *        200:
   *          description: Succeeded to update customize script
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeScript'
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
