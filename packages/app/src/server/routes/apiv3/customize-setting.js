/* eslint-disable no-unused-vars */

import { ErrorV3 } from '@growi/core';

import { SupportedAction } from '~/interfaces/activity';
import { AttachmentType } from '~/server/interfaces/attachment';
import loggerFactory from '~/utils/logger';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';


const logger = loggerFactory('growi:routes:apiv3:customize-setting');

const express = require('express');

const router = express.Router();

const { body, query } = require('express-validator');
const multer = require('multer');


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
 *      CustomizeLayout:
 *        description: CustomizeLayout
 *        type: object
 *        properties:
 *          isContainerFluid:
 *            type: boolean
 *      CustomizeTheme:
 *        description: CustomizeTheme
 *        type: object
 *        properties:
 *          themeType:
 *            type: string
 *      CustomizeFunction:
 *        description: CustomizeFunction
 *        type: object
 *        properties:
 *          isEnabledTimeline:
 *            type: boolean
 *          isEnabledAttachTitleHeader:
 *            type: boolean
 *          pageLimitationS:
 *            type: number
 *          pageLimitationM:
 *            type: number
 *          isEnabledStaleNotification:
 *            type: boolean
 *          isAllReplyShown:
 *            type: boolean
 *          isSearchScopeChildrenAsDefault:
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
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const addActivity = generateAddActivityMiddleware(crowi);

  const activityEvent = crowi.event('activity');

  const { customizeService, attachmentService } = crowi;
  const Attachment = crowi.model('Attachment');
  const uploads = multer({ dest: `${crowi.tmpDir}uploads` });
  const validator = {
    layout: [
      body('isContainerFluid').isBoolean(),
    ],
    themeAssetPath: [
      query('themeName').isString(),
    ],
    theme: [
      body('themeType').isString(),
    ],
    sidebar: [
      body('isSidebarDrawerMode').isBoolean(),
      body('isSidebarClosedAtDockMode').isBoolean(),
    ],
    function: [
      body('isEnabledTimeline').isBoolean(),
      body('isEnabledAttachTitleHeader').isBoolean(),
      body('pageLimitationS').isInt().isInt({ min: 1, max: 1000 }),
      body('pageLimitationM').isInt().isInt({ min: 1, max: 1000 }),
      body('pageLimitationL').isInt().isInt({ min: 1, max: 1000 }),
      body('pageLimitationXL').isInt().isInt({ min: 1, max: 1000 }),
      body('isEnabledStaleNotification').isBoolean(),
      body('isAllReplyShown').isBoolean(),
      body('isSearchScopeChildrenAsDefault').isBoolean(),
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
    logo: [
      body('isDefaultLogo').isBoolean().optional({ nullable: true }),
      body('customizedLogoSrc').isString().optional({ nullable: true }),
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
      themeType: await crowi.configManager.getConfig('crowi', 'customize:theme'),
      isEnabledTimeline: await crowi.configManager.getConfig('crowi', 'customize:isEnabledTimeline'),
      isEnabledAttachTitleHeader: await crowi.configManager.getConfig('crowi', 'customize:isEnabledAttachTitleHeader'),
      pageLimitationS: await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationS'),
      pageLimitationM: await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationM'),
      pageLimitationL: await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationL'),
      pageLimitationXL: await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationXL'),
      isEnabledStaleNotification: await crowi.configManager.getConfig('crowi', 'customize:isEnabledStaleNotification'),
      isAllReplyShown: await crowi.configManager.getConfig('crowi', 'customize:isAllReplyShown'),
      isSearchScopeChildrenAsDefault: await crowi.configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault'),
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
   *    /customize-setting/layout:
   *      get:
   *        tags: [CustomizeSetting]
   *        operationId: getLayoutCustomizeSetting
   *        summary: /customize-setting/layout
   *        description: Get layout
   *        responses:
   *          200:
   *            description: Succeeded to get layout
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeLayout'
   */
  router.get('/layout', loginRequiredStrictly, adminRequired, async(req, res) => {

    try {
      const isContainerFluid = await crowi.configManager.getConfig('crowi', 'customize:isContainerFluid');
      return res.apiv3({ isContainerFluid });
    }
    catch (err) {
      const msg = 'Error occurred in getting layout';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'get-layout-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /customize-setting/layout:
   *      put:
   *        tags: [CustomizeSetting]
   *        operationId: updateLayoutCustomizeSetting
   *        summary: /customize-setting/layout
   *        description: Update layout
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeLayout'
   *        responses:
   *          200:
   *            description: Succeeded to update layout
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeLayout'
   */
  router.put('/layout', loginRequiredStrictly, adminRequired, addActivity, validator.layout, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:isContainerFluid': req.body.isContainerFluid,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        isContainerFluid: await crowi.configManager.getConfig('crowi', 'customize:isContainerFluid'),
      };

      const parameters = { action: SupportedAction.ACTION_ADMIN_LAYOUT_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);

      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating layout';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-layout-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /customize-setting/theme/asset-path:
   *      put:
   *        tags: [CustomizeSetting]
   *        operationId: getThemeAssetPath
   *        summary: /customize-setting/theme/asset-path
   *        description: Get theme asset path
   *        parameters:
   *          - name: themeName
   *            in: query
   *            required: true
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Succeeded to get theme asset path
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    assetPath:
   *                      type: string
   */
  router.get('/theme/asset-path', loginRequiredStrictly, adminRequired, validator.themeAssetPath, apiV3FormValidator, async(req, res) => {
    const { themeName } = req.query;

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
   *    /customize-setting/theme:
   *      put:
   *        tags: [CustomizeSetting]
   *        operationId: updateThemeCustomizeSetting
   *        summary: /customize-setting/theme
   *        description: Update theme
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeTheme'
   *        responses:
   *          200:
   *            description: Succeeded to update theme
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeTheme'
   */
  router.put('/theme', loginRequiredStrictly, adminRequired, addActivity, validator.theme, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:theme': req.body.themeType,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        themeType: await crowi.configManager.getConfig('crowi', 'customize:theme'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_THEME_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating theme';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-theme-failed'));
    }
  });

  // sidebar
  router.get('/sidebar', loginRequiredStrictly, adminRequired, async(req, res) => {

    try {
      const isSidebarDrawerMode = await crowi.configManager.getConfig('crowi', 'customize:isSidebarDrawerMode');
      const isSidebarClosedAtDockMode = await crowi.configManager.getConfig('crowi', 'customize:isSidebarClosedAtDockMode');
      return res.apiv3({ isSidebarDrawerMode, isSidebarClosedAtDockMode });
    }
    catch (err) {
      const msg = 'Error occurred in getting sidebar';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'get-sidebar-failed'));
    }
  });

  router.put('/sidebar', loginRequiredStrictly, adminRequired, validator.sidebar, apiV3FormValidator, addActivity, async(req, res) => {
    const requestParams = {
      'customize:isSidebarDrawerMode': req.body.isSidebarDrawerMode,
      'customize:isSidebarClosedAtDockMode': req.body.isSidebarClosedAtDockMode,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        isSidebarDrawerMode: await crowi.configManager.getConfig('crowi', 'customize:isSidebarDrawerMode'),
        isSidebarClosedAtDockMode: await crowi.configManager.getConfig('crowi', 'customize:isSidebarClosedAtDockMode'),
      };

      activityEvent.emit('update', res.locals.activity._id, { action: SupportedAction.ACTION_ADMIN_SIDEBAR_UPDATE });

      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating sidebar';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-sidebar-failed'));
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
  router.put('/function', loginRequiredStrictly, adminRequired, addActivity, validator.function, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:isEnabledTimeline': req.body.isEnabledTimeline,
      'customize:isEnabledAttachTitleHeader': req.body.isEnabledAttachTitleHeader,
      'customize:showPageLimitationS': req.body.pageLimitationS,
      'customize:showPageLimitationM': req.body.pageLimitationM,
      'customize:showPageLimitationL': req.body.pageLimitationL,
      'customize:showPageLimitationXL': req.body.pageLimitationXL,
      'customize:isEnabledStaleNotification': req.body.isEnabledStaleNotification,
      'customize:isAllReplyShown': req.body.isAllReplyShown,
      'customize:isSearchScopeChildrenAsDefault': req.body.isSearchScopeChildrenAsDefault,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        isEnabledTimeline: await crowi.configManager.getConfig('crowi', 'customize:isEnabledTimeline'),
        isEnabledAttachTitleHeader: await crowi.configManager.getConfig('crowi', 'customize:isEnabledAttachTitleHeader'),
        pageLimitationS: await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationS'),
        pageLimitationM: await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationM'),
        pageLimitationL: await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationL'),
        pageLimitationXL: await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationXL'),
        isEnabledStaleNotification: await crowi.configManager.getConfig('crowi', 'customize:isEnabledStaleNotification'),
        isAllReplyShown: await crowi.configManager.getConfig('crowi', 'customize:isAllReplyShown'),
        isSearchScopeChildrenAsDefault: await crowi.configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_FUNCTION_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
  router.put('/highlight', loginRequiredStrictly, adminRequired, addActivity, validator.highlight, apiV3FormValidator, async(req, res) => {
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
      const parameters = { action: SupportedAction.ACTION_ADMIN_CODE_HIGHLIGHT_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
  router.put('/customize-title', loginRequiredStrictly, adminRequired, addActivity, validator.customizeTitle, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:title': req.body.customizeTitle,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams, true);
      crowi.customizeService.publishUpdatedMessage();

      const customizedParams = {
        customizeTitle: await crowi.configManager.getConfig('crowi', 'customize:title'),
      };
      customizeService.initCustomTitle();
      const parameters = { action: SupportedAction.ACTION_ADMIN_CUSTOM_TITLE_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
  router.put('/customize-header', loginRequiredStrictly, adminRequired, addActivity, validator.customizeHeader, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:header': req.body.customizeHeader,
    };
    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        customizeHeader: await crowi.configManager.getConfig('crowi', 'customize:header'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_CUSTOM_HTML_HEADER_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
  router.put('/customize-css', loginRequiredStrictly, adminRequired, addActivity, validator.customizeCss, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:css': req.body.customizeCss,
    };
    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams, true);
      crowi.customizeService.publishUpdatedMessage();

      const customizedParams = {
        customizeCss: await crowi.configManager.getConfig('crowi', 'customize:css'),
      };
      customizeService.initCustomCss();
      const parameters = { action: SupportedAction.ACTION_ADMIN_CUSTOM_CSS_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
  router.put('/customize-script', loginRequiredStrictly, adminRequired, addActivity, validator.customizeScript, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:script': req.body.customizeScript,
    };
    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        customizeScript: await crowi.configManager.getConfig('crowi', 'customize:script'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_CUSTOM_SCRIPT_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating customizeScript';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-customizeScript-failed'));
    }
  });

  router.get('/customize-logo', loginRequiredStrictly, adminRequired, async(req, res) => {
    const isDefaultLogo = await crowi.configManager.getConfig('crowi', 'customize:isDefaultLogo');
    const customizedLogoSrc = await crowi.configManager.getConfig('crowi', 'customize:customizedLogoSrc');
    return res.apiv3({ isDefaultLogo, customizedLogoSrc });
  });

  router.put('/customize-logo', loginRequiredStrictly, adminRequired, validator.logo, apiV3FormValidator, async(req, res) => {

    const {
      isDefaultLogo, customizedLogoSrc,
    } = req.body;

    const requestParams = {
      'customize:isDefaultLogo': isDefaultLogo,
      'customize:customizedLogoSrc': customizedLogoSrc,
    };
    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const customizedParams = {
        isDefaultLogo: await crowi.configManager.getConfig('crowi', 'customize:isDefaultLogo'),
        customizedLogoSrc: await crowi.configManager.getConfig('crowi', 'customize:customizedLogoSrc'),
      };
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating customizeLogo';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-customizeLogo-failed'));
    }
  });

  router.post('/upload-brand-logo', uploads.single('file'), loginRequiredStrictly,
    adminRequired, validator.logo, apiV3FormValidator, async(req, res) => {

      if (req.file == null) {
        return res.apiv3Err(new ErrorV3('File error.', 'upload-brand-logo-failed'));
      }
      if (req.user == null) {
        return res.apiv3Err(new ErrorV3('param "user" must be set.', 'upload-brand-logo-failed'));
      }

      const file = req.file;

      // check type
      const acceptableFileType = /image\/.+/;
      if (!file.mimetype.match(acceptableFileType)) {
        const msg = 'File type error. Only image files is allowed to set as user picture.';
        return res.apiv3Err(new ErrorV3(msg, 'upload-brand-logo-failed'));
      }

      // Check if previous attachment exists and remove it
      const attachments = await Attachment.find({ attachmentType: AttachmentType.BRAND_LOGO });
      if (attachments != null) {
        await attachmentService.removeAllAttachments(attachments);
      }

      let attachment;
      try {
        attachment = await attachmentService.createAttachment(file, req.user, null, AttachmentType.BRAND_LOGO);
        const attachmentConfigParams = {
          'customize:customizedLogoSrc': attachment.filePathProxied,
        };

        await crowi.configManager.updateConfigsInTheSameNamespace('crowi', attachmentConfigParams);
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3(err.message, 'upload-brand-logo-failed'));
      }
      attachment.toObject({ virtuals: true });
      return res.apiv3({ attachment });
    });

  router.delete('/delete-brand-logo', loginRequiredStrictly, adminRequired, async(req, res) => {

    const attachments = await Attachment.find({ attachmentType: AttachmentType.BRAND_LOGO });

    if (attachments == null) {
      return res.apiv3Err(new ErrorV3('attachment not found', 'delete-brand-logo-failed'));
    }

    try {
      await attachmentService.removeAllAttachments(attachments);
      // update attachmentId immediately
      const attachmentConfigParams = { 'customize:customizedLogoSrc': null };
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', attachmentConfigParams);
    }
    catch (err) {
      logger.error(err);
      return res.status(500).apiv3Err(new ErrorV3('Error while deleting logo', 'delete-brand-logo-failed'));
    }

    return res.apiv3({});
  });

  return router;
};
