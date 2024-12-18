/* eslint-disable no-unused-vars */

import { GrowiPluginType } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';

import { GrowiPlugin } from '~/features/growi-plugin/server/models';
import { SupportedAction } from '~/interfaces/activity';
import { AttachmentType } from '~/server/interfaces/attachment';
import { Attachment } from '~/server/models/attachment';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';


const logger = loggerFactory('growi:routes:apiv3:customize-setting');

const router = express.Router();


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
 *      CustomizeNoscript:
 *        description: CustomizeNoscript
 *        type: object
 *        properties:
 *          customizeNoscript:
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
  const uploads = multer({ dest: `${crowi.tmpDir}uploads` });
  const validator = {
    layout: [
      body('isContainerFluid').isBoolean(),
    ],
    theme: [
      body('theme').isString(),
    ],
    sidebar: [
      body('isSidebarCollapsedMode').isBoolean(),
      body('isSidebarClosedAtDockMode').optional().isBoolean(),
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
    CustomizePresentation: [
      body('isEnabledMarp').isBoolean(),
    ],
    customizeTitle: [
      body('customizeTitle').isString(),
    ],
    highlight: [
      body('highlightJsStyle').isString().isIn([
        'github', 'github-gist', 'atom-one-light', 'xcode', 'vs', 'atom-one-dark', 'hybrid', 'monokai', 'tomorrow-night', 'vs2015',
      ]),
      body('highlightJsStyleBorder').isBoolean(),
    ],
    customizeScript: [
      body('customizeScript').isString(),
    ],
    customizeCss: [
      body('customizeCss').isString(),
    ],
    customizeNoscript: [
      body('customizeNoscript').isString(),
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
      isEnabledTimeline: await configManager.getConfig('customize:isEnabledTimeline'),
      isEnabledAttachTitleHeader: await configManager.getConfig('customize:isEnabledAttachTitleHeader'),
      pageLimitationS: await configManager.getConfig('customize:showPageLimitationS'),
      pageLimitationM: await configManager.getConfig('customize:showPageLimitationM'),
      pageLimitationL: await configManager.getConfig('customize:showPageLimitationL'),
      pageLimitationXL: await configManager.getConfig('customize:showPageLimitationXL'),
      isEnabledStaleNotification: await configManager.getConfig('customize:isEnabledStaleNotification'),
      isAllReplyShown: await configManager.getConfig('customize:isAllReplyShown'),
      isSearchScopeChildrenAsDefault: await configManager.getConfig('customize:isSearchScopeChildrenAsDefault'),
      isEnabledMarp: await configManager.getConfig('customize:isEnabledMarp'),
      styleName: await configManager.getConfig('customize:highlightJsStyle'),
      styleBorder: await configManager.getConfig('customize:highlightJsStyleBorder'),
      customizeTitle: await configManager.getConfig('customize:title'),
      customizeScript: await configManager.getConfig('customize:script'),
      customizeCss: await configManager.getConfig('customize:css'),
      customizeNoscript: await configManager.getConfig('customize:noscript'),
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
      const isContainerFluid = await configManager.getConfig('customize:isContainerFluid');
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
      await configManager.updateConfigs(requestParams);
      const customizedParams = {
        isContainerFluid: await configManager.getConfig('customize:isContainerFluid'),
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

  router.get('/theme', loginRequiredStrictly, async(req, res) => {

    try {
      const currentTheme = await configManager.getConfig('customize:theme');

      // retrieve plugin manifests
      const themePlugins = await GrowiPlugin.findEnabledPluginsByType(GrowiPluginType.Theme);

      const pluginThemesMetadatas = themePlugins
        .map(themePlugin => themePlugin.meta.themes)
        .flat();

      return res.apiv3({ currentTheme, pluginThemesMetadatas });
    }
    catch (err) {
      const msg = 'Error occurred in getting theme';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'get-theme-failed'));
    }
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
      'customize:theme': req.body.theme,
    };

    try {
      await configManager.updateConfigs(requestParams);
      const customizedParams = {
        theme: await configManager.getConfig('customize:theme'),
      };
      customizeService.initGrowiTheme();
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
      const isSidebarCollapsedMode = await configManager.getConfig('customize:isSidebarCollapsedMode');
      const isSidebarClosedAtDockMode = await configManager.getConfig('customize:isSidebarClosedAtDockMode');
      return res.apiv3({ isSidebarCollapsedMode, isSidebarClosedAtDockMode });
    }
    catch (err) {
      const msg = 'Error occurred in getting sidebar';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'get-sidebar-failed'));
    }
  });

  router.put('/sidebar', loginRequiredStrictly, adminRequired, validator.sidebar, apiV3FormValidator, addActivity, async(req, res) => {
    const requestParams = {
      'customize:isSidebarCollapsedMode': req.body.isSidebarCollapsedMode,
      'customize:isSidebarClosedAtDockMode': req.body.isSidebarClosedAtDockMode,
    };

    try {
      await configManager.updateConfigs(requestParams);
      const customizedParams = {
        isSidebarCollapsedMode: await configManager.getConfig('customize:isSidebarCollapsedMode'),
        isSidebarClosedAtDockMode: await configManager.getConfig('customize:isSidebarClosedAtDockMode'),
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
      await configManager.updateConfigs(requestParams);
      const customizedParams = {
        isEnabledTimeline: await configManager.getConfig('customize:isEnabledTimeline'),
        isEnabledAttachTitleHeader: await configManager.getConfig('customize:isEnabledAttachTitleHeader'),
        pageLimitationS: await configManager.getConfig('customize:showPageLimitationS'),
        pageLimitationM: await configManager.getConfig('customize:showPageLimitationM'),
        pageLimitationL: await configManager.getConfig('customize:showPageLimitationL'),
        pageLimitationXL: await configManager.getConfig('customize:showPageLimitationXL'),
        isEnabledStaleNotification: await configManager.getConfig('customize:isEnabledStaleNotification'),
        isAllReplyShown: await configManager.getConfig('customize:isAllReplyShown'),
        isSearchScopeChildrenAsDefault: await configManager.getConfig('customize:isSearchScopeChildrenAsDefault'),
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


  router.put('/presentation', loginRequiredStrictly, adminRequired, addActivity, validator.CustomizePresentation, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:isEnabledMarp': req.body.isEnabledMarp,
    };

    try {
      await configManager.updateConfigs(requestParams);
      const customizedParams = {
        isEnabledMarp: await configManager.getConfig('customize:isEnabledMarp'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_FUNCTION_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating presentaion';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-presentation-failed'));
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
      await configManager.updateConfigs(requestParams);
      const customizedParams = {
        styleName: await configManager.getConfig('customize:highlightJsStyle'),
        styleBorder: await configManager.getConfig('customize:highlightJsStyleBorder'),
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
      await configManager.updateConfigs(requestParams, { skipPubsub: true });
      crowi.customizeService.publishUpdatedMessage();

      const customizedParams = {
        customizeTitle: await configManager.getConfig('customize:title'),
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
   *    /customize-setting/customize-noscript:
   *      put:
   *        tags: [CustomizeSetting]
   *        operationId: updateCustomizeNoscriptCustomizeSetting
   *        summary: /customize-setting/customize-noscript
   *        description: Update customizeNoscript
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CustomizeNoscript'
   *        responses:
   *          200:
   *            description: Succeeded to update customize header
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/CustomizeNoscript'
   */
  router.put('/customize-noscript', loginRequiredStrictly, adminRequired, addActivity, validator.customizeNoscript, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'customize:noscript': req.body.customizeNoscript,
    };
    try {
      await configManager.updateConfigs(requestParams);
      const customizedParams = {
        customizeNoscript: await configManager.getConfig('customize:noscript'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_CUSTOM_NOSCRIPT_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
      return res.apiv3({ customizedParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating customizeNoscript';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-customizeNoscript-failed'));
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
      await configManager.updateConfigs(requestParams, { skipPubsub: true });
      crowi.customizeService.publishUpdatedMessage();

      const customizedParams = {
        customizeCss: await configManager.getConfig('customize:css'),
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
      await configManager.updateConfigs(requestParams);
      const customizedParams = {
        customizeScript: await configManager.getConfig('customize:script'),
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

  router.put('/customize-logo', loginRequiredStrictly, adminRequired, validator.logo, apiV3FormValidator, async(req, res) => {

    const {
      isDefaultLogo,
    } = req.body;

    const requestParams = {
      'customize:isDefaultLogo': isDefaultLogo,
    };
    try {
      await configManager.updateConfigs(requestParams);
      const customizedParams = {
        isDefaultLogo: await configManager.getConfig('customize:isDefaultLogo'),
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
    }
    catch (err) {
      logger.error(err);
      return res.status(500).apiv3Err(new ErrorV3('Error while deleting logo', 'delete-brand-logo-failed'));
    }

    return res.apiv3({});
  });

  return router;
};
