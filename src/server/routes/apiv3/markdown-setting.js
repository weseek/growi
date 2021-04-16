import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:markdown-setting');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator');

const ErrorV3 = require('../../models/vo/error-apiv3');

const validator = {
  lineBreak: [
    body('isEnabledLinebreaks').isBoolean(),
    body('isEnabledLinebreaksInComments').isBoolean(),
  ],
  indent: [
    body('adminPreferredIndentSize').isIn([2, 4]),
    body('isIndentSizeForced').isBoolean(),
  ],
  presentationSetting: [
    body('pageBreakSeparator').isInt().not().isEmpty(),
  ],
  xssSetting: [
    body('isEnabledXss').isBoolean(),
    body('tagWhiteList').isArray(),
    body('attrWhiteList').isArray(),
  ],
};


/**
 * @swagger
 *  tags:
 *    name: MarkDownSetting
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      LineBreakParams:
 *        description: LineBreakParams
 *        type: object
 *        properties:
 *          isEnabledLinebreaks:
 *            type: boolean
 *            description: enable lineBreak
 *          isEnabledLinebreaksInComments:
 *            type: boolean
 *            description: enable lineBreak in comment
 *      PresentationParams:
 *        description: PresentationParams
 *        type: object
 *        properties:
 *          pageBreakSeparator:
 *            type: number
 *            description: number of pageBreakSeparator
 *          pageBreakCustomSeparator:
 *            type: string
 *            description: string of pageBreakCustomSeparator
 *      XssParams:
 *        description: XssParams
 *        type: object
 *        properties:
 *          isEnabledPrevention:
 *            type: boolean
 *            description: enable xss
 *          xssOption:
 *            type: number
 *            description: number of xss option
 *          tagWhiteList:
 *            type: array
 *            description: array of tag whiteList
 *            items:
 *              type: string
 *              description: tag whitelist
 *          attrWhiteList:
 *            type: array
 *            description: array of attr whiteList
 *            items:
 *              type: string
 *              description: attr whitelist
 */

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  /**
   * @swagger
   *
   *    /markdown-setting:
   *      get:
   *        tags: [MarkDownSetting]
   *        operationId: getMarkdownSetting
   *        summary: /markdown-setting
   *        description: Get markdown parameters
   *        responses:
   *          200:
   *            description: params of markdown
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    markdownParams:
   *                      type: object
   *                      description: markdown params
   */
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {
    const markdownParams = {
      isEnabledLinebreaks: await crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
      isEnabledLinebreaksInComments: await crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
      adminPreferredIndentSize: await crowi.configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
      isIndentSizeForced: await crowi.configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),
      pageBreakSeparator: await crowi.configManager.getConfig('markdown', 'markdown:presentation:pageBreakSeparator'),
      pageBreakCustomSeparator: await crowi.configManager.getConfig('markdown', 'markdown:presentation:pageBreakCustomSeparator'),
      isEnabledXss: await crowi.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention'),
      xssOption: await crowi.configManager.getConfig('markdown', 'markdown:xss:option'),
      tagWhiteList: await crowi.configManager.getConfig('markdown', 'markdown:xss:tagWhiteList'),
      attrWhiteList: await crowi.configManager.getConfig('markdown', 'markdown:xss:attrWhiteList'),
    };

    return res.apiv3({ markdownParams });
  });

  /**
   * @swagger
   *
   *    /markdown-setting/lineBreak:
   *      put:
   *        tags: [MarkDownSetting]
   *        operationId: updateLineBreakMarkdownSetting
   *        summary: /markdown-setting/lineBreak
   *        description: Update lineBreak setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/LineBreakParams'
   *        responses:
   *          200:
   *            description: Succeeded to update lineBreak setting
   *            content:
   *              application/json:
   *                schema:
  *                   $ref: '#/components/schemas/LineBreakParams'
   */
  router.put('/lineBreak', loginRequiredStrictly, adminRequired, validator.lineBreak, apiV3FormValidator, async(req, res) => {

    const requestLineBreakParams = {
      'markdown:isEnabledLinebreaks': req.body.isEnabledLinebreaks,
      'markdown:isEnabledLinebreaksInComments': req.body.isEnabledLinebreaksInComments,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('markdown', requestLineBreakParams);
      const lineBreaksParams = {
        isEnabledLinebreaks: await crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
        isEnabledLinebreaksInComments: await crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
      };
      return res.apiv3({ lineBreaksParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating lineBreak';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-lineBreak-failed'));
    }

  });

  router.put('/indent', loginRequiredStrictly, adminRequired, validator.indent, apiV3FormValidator, async(req, res) => {

    const requestIndentParams = {
      'markdown:adminPreferredIndentSize': req.body.adminPreferredIndentSize,
      'markdown:isIndentSizeForced': req.body.isIndentSizeForced,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('markdown', requestIndentParams);
      const indentParams = {
        adminPreferredIndentSize: await crowi.configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
        isIndentSizeForced: await crowi.configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),
      };
      return res.apiv3({ indentParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating indent';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-indent-failed'));
    }

  });

  /**
   * @swagger
   *
   *    /markdown-setting/presentation:
   *      put:
   *        tags: [MarkDownSetting]
   *        operationId: updatePresentationMarkdownSetting
   *        summary: /markdown-setting/presentation
   *        description: Update presentation
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/PresentationParams'
   *        responses:
   *          200:
   *            description: Succeeded to update presentation setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/PresentationParams'
   */
  router.put('/presentation', loginRequiredStrictly, adminRequired, validator.presentationSetting, apiV3FormValidator, async(req, res) => {
    if (req.body.pageBreakSeparator === 3 && req.body.pageBreakCustomSeparator === '') {
      return res.apiv3Err(new ErrorV3('customRegularExpression is required'));
    }

    const requestPresentationParams = {
      'markdown:presentation:pageBreakSeparator': req.body.pageBreakSeparator,
      'markdown:presentation:pageBreakCustomSeparator': req.body.pageBreakCustomSeparator,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('markdown', requestPresentationParams);
      const presentationParams = {
        pageBreakSeparator: await crowi.configManager.getConfig('markdown', 'markdown:presentation:pageBreakSeparator'),
        pageBreakCustomSeparator: await crowi.configManager.getConfig('markdown', 'markdown:presentation:pageBreakCustomSeparator') || '',
      };
      return res.apiv3({ presentationParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating presentation';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-presentation-failed'));
    }

  });

  /**
   * @swagger
   *
   *    /markdown-setting/xss:
   *      put:
   *        tags: [MarkDownSetting]
   *        operationId: updateXssMarkdownSetting
   *        summary: /markdown-setting/xss
   *        description: Update xss
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/XssParams'
   *        responses:
   *          200:
   *            description: Succeeded to update xss setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/XssParams'
   */
  router.put('/xss', loginRequiredStrictly, adminRequired, validator.xssSetting, apiV3FormValidator, async(req, res) => {
    if (req.body.isEnabledXss && req.body.xssOption == null) {
      return res.apiv3Err(new ErrorV3('xss option is required'));
    }

    const reqestXssParams = {
      'markdown:xss:isEnabledPrevention': req.body.isEnabledXss,
      'markdown:xss:option': req.body.xssOption,
      'markdown:xss:tagWhiteList': req.body.tagWhiteList,
      'markdown:xss:attrWhiteList': req.body.attrWhiteList,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('markdown', reqestXssParams);
      const xssParams = {
        isEnabledXss: await crowi.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention'),
        xssOption: await crowi.configManager.getConfig('markdown', 'markdown:xss:option'),
        tagWhiteList: await crowi.configManager.getConfig('markdown', 'markdown:xss:tagWhiteList'),
        attrWhiteList: await crowi.configManager.getConfig('markdown', 'markdown:xss:attrWhiteList'),
      };
      return res.apiv3({ xssParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating xss';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-xss-failed'));
    }

  });

  return router;
};
