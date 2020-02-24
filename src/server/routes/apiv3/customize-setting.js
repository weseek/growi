/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:customize-setting');

const express = require('express');

const router = express.Router();

const { body, query } = require('express-validator');
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
 *        description: CustomizeLayoutTheme
 *        type: object
 *        properties:
 *          layoutType:
 *            type: string
 *          themeType:
 *            type: string
 *      CustomizeBehavior:
 *        description: CustomizeBehavior
 *        type: object
 *        properties:
 *          behaviorType:
 *            type: string
 *      CustomizeFunction:
 *        description: CustomizeFunction
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
 *          isEnabledStaleNotification:
 *            type: boolean
 *          isAllReplyShown:
 *            type: boolean
 *      CustomizeHighlight:
 *        description: CustomizeHighlight
 *        type: object
 *        properties:
 *          styleName:
 *            type: string
 *          styleBorder:
 *            type: boolean
 *      CustomizeTitle:
 *        description: CustomizeTitle
 *        type: object
 *        properties:
 *          customizeTitle:
 *            type: string
 *      CustomizeHeader:
 *        description: CustomizeHeader
 *        type: object
 *        properties:
 *          customizeHeader:
 *            type: string
 *      CustomizeCss:
 *        description: CustomizeCss
 *        type: object
 *        properties:
 *          customizeCss:
 *            type: string
 *      CustomizeScript:
 *        description: CustomizeScript
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
    themeAssetPath: [
      query('themeName').isString().isIn([
        'default', 'nature', 'mono-blue', 'wood', 'island', 'christmas', 'antarctic', 'default-dark', 'future', 'blue-night', 'halloween', 'spring',
      ]),
    ],
    layoutTheme: [
      body('layoutType').isString().isIn(['growi', 'kibela', 'crowi']),
      body('themeType').isString().isIn([
        'default', 'nature', 'mono-blue', 'wood', 'island', 'christmas', 'antarctic', 'default-dark', 'future', 'blue-night', 'halloween', 'spring',
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
      body('isEnabledStaleNotification').isBoolean(),
      body('isAllReplyShown').isBoolean(),
    ],
    customizeTitle: [
      body('customizeTitle').isString(),
    ],
    customizeHeader: [
      body('customizeHeader').isString(),
    ],
    highlight: [
      body('highlightJsStyle').isString().isIn([
        'github', 'github-gist', 'atom-one-light', 'xcode', 'vs', 'atom-one-dark', 'hybrid', 'monokai', 'tomorrow-night', 'vs2015',
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
   *    /customize-setting:
   *      get:
   *        tags: [CustomizeSetting]
   *        operationId: getCustomizeSetting
   *        summary: /customize-setting
   *        description: Get customize parameters
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
      isEnabledStaleNotification: await crowi.configManager.getConfig('crowi', 'customize:isEnabledStaleNotification'),
      isAllReplyShown: await crowi.configManager.getConfig('crowi', 'customize:isAllReplyShown'),
      styleName: await crowi.configManager.getConfig('crowi', 'customize:highlightJsStyle'),
      styleBorder: await crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
      customizeTitle: await crowi.configManager.getConfig('crowi', 'customize:title'),
      customizeHeader: await crowi.configManager.getConfig('crowi', 'customize:header'),
      customizeCss: await crowi.configManager.getConfig('crowi', 'customize:css'),
      customizeScript: await crowi.configManager.getConfig('crowi', 'customize:script'),
    };

    return res.apiv3({ customizeParams });
  });

  /**
   * @swagger
   *
   *    /customize-setting/layout-theme/asset-path:
   *      put:
   *        tags: [CustomizeSetting]
   *        operationId: getLayoutThemeAssetPath
   *        summary: /customize-setting/layout-theme/asset-path
   *        description: Get layout theme asset path
   *        parameters:
   *          - name: themeName
   *            in: query
   *            required: true
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Succeeded to update layout and theme
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    assetPath:
   *                      type: string
   */
  router.get('/layout-theme/asset-path', loginRequiredStrictly, adminRequired, validator.themeAssetPath, ApiV3FormValidator, async(req, res) => {
    const themeName = req.query.themeName;

    const webpackAssetKey = `styles/theme-${themeName}.css`;
    const assetPath = res.locals.webpack_asset(webpackAssetKey);

    if (assetPath == null) {
      return res.apiv3Err(new ErrorV3(`The asset for '${webpackAssetKey}' is undefined.`, 'invalid-asset'));
    }

    return res.apiv3({ assetPath });
  });

  /**
   * @swagger
   *
   *    /customize-setting/layout-theme:
   *      put:
   *        tags: [CustomizeSetting]
   *        operationId: updateLayoutThemeCustomizeSetting
   *        summary: /customize-setting/layout-theme
   *        description: Update layout and theme
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeLayoutTheme'
   *        responses:
   *          200:
   *            description: Succeeded to update layout and theme
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeLayoutTheme'
   */
  router.put('/layout-theme', loginRequiredStrictly, adminRequired, csrf, validator.layoutTheme, ApiV3FormValidator, async(req, res) => {
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
   *        operationId: updateBehaviorCustomizeSetting
   *        summary: /customize-setting/behavior
   *        description: Update behavior
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeBehavior'
   *        responses:
   *          200:
   *            description: Succeeded to update behavior
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeBehavior'
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
   *        operationId: updateFunctionCustomizeSetting
   *        summary: /customize-setting/function
   *        description: Update function
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeFunction'
   *        responses:
   *          200:
   *            description: Succeeded to update function
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeFunction'
   */
  router.put('/function', loginRequiredStrictly, adminRequired, csrf, validator.function, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:isEnabledTimeline': req.body.isEnabledTimeline,
      'customize:isSavedStatesOfTabChanges': req.body.isSavedStatesOfTabChanges,
      'customize:isEnabledAttachTitleHeader': req.body.isEnabledAttachTitleHeader,
      'customize:showRecentCreatedNumber': req.body.recentCreatedLimit,
      'customize:isEnabledStaleNotification': req.body.isEnabledStaleNotification,
      'customize:isAllReplyShown': req.body.isAllReplyShown,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        isEnabledTimeline: await crowi.configManager.getConfig('crowi', 'customize:isEnabledTimeline'),
        isSavedStatesOfTabChanges: await crowi.configManager.getConfig('crowi', 'customize:isSavedStatesOfTabChanges'),
        isEnabledAttachTitleHeader: await crowi.configManager.getConfig('crowi', 'customize:isEnabledAttachTitleHeader'),
        recentCreatedLimit: await crowi.configManager.getConfig('crowi', 'customize:showRecentCreatedNumber'),
        isEnabledStaleNotification: await crowi.configManager.getConfig('crowi', 'customize:isEnabledStaleNotification'),
        isAllReplyShown: await crowi.configManager.getConfig('crowi', 'customize:isAllReplyShown'),
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
   *        operationId: updateHighlightCustomizeSetting
   *        summary: /customize-setting/highlight
   *        description: Update highlight
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeHighlight'
   *        responses:
   *          200:
   *            description: Succeeded to update highlight
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeHighlight'
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
   *        operationId: updateCustomizeTitleCustomizeSetting
   *        summary: /customize-setting/customizeTitle
   *        description: Update customizeTitle
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeTitle'
   *        responses:
   *          200:
   *            description: Succeeded to update customizeTitle
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeTitle'
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
   *        operationId: updateCustomizeHeaderCustomizeSetting
   *        summary: /customize-setting/customizeHeader
   *        description: Update customizeHeader
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeHeader'
   *        responses:
   *          200:
   *            description: Succeeded to update customize header
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeHeader'
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
   *        operationId: updateCustomizeCssCustomizeSetting
   *        summary: /customize-setting/customizeCss
   *        description: Update customizeCss
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeCss'
   *        responses:
   *          200:
   *            description: Succeeded to update customize css
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeCss'
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
   *        operationId: updateCustomizeScriptCustomizeSetting
   *        summary: /customize-setting/customizeScript
   *        description: Update customizeScript
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeScript'
   *        responses:
   *          200:
   *            description: Succeeded to update customize script
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeScript'
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
