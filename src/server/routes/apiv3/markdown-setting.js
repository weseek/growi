/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:user-group');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');

const validator = {};

/**
 * @swagger
 *  tags:
 *    name: MarkDownSetting
 */

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const {
    ErrorV3,
    Config,
  } = crowi.models;

  const { ApiV3FormValidator } = crowi.middlewares;

  validator.lineBreak = [
    body('isEnabledLinebreaks').isBoolean(),
    body('isEnabledLinebreaksInComments').isBoolean(),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/markdown-setting/lineBreak:
   *      put:
   *        tags: [MarkDownSetting]
   *        description: Update lineBreak
   *        parameters:
   *          - name: isEnabledLinebreaks
   *            in: query
   *            description: enable lineBreak
   *            schema:
   *              type: boolean
   *          - name: isEnabledLinebreaksInComments
   *            in: query
   *            description: enable lineBreak in comment
   *            schema:
   *              type: boolean
   *        responses:
   *          200:
   *            description: Updating lineBreak success
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    xssParams:
   *                      type: object
   *                      description: new lineBreak params
   */
  router.put('/lineBreak', loginRequiredStrictly, adminRequired, csrf, validator.lineBreak, ApiV3FormValidator, async(req, res) => {

    const lineBreakParams = {
      'markdown:isEnabledLinebreaks': req.body.isEnabledLinebreaks,
      'markdown:isEnabledLinebreaksInComments': req.body.isEnabledLinebreaksInComments,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('markdown', lineBreakParams);
      return res.apiv3({ lineBreakParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating lineBreak';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-lineBreak-failed'));
    }

  });

  validator.xssSetting = [
    body('isEnabledXss').isBoolean(),
    body('tagWhiteList').isArray(),
    body('attrWhiteList').isArray(),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/markdown-setting/xss:
   *      put:
   *        tags: [MarkDownSetting]
   *        description: Update xss
   *        parameters:
   *          - name: isEnabledPrevention
   *            in: query
   *            description: enable xss
   *            schema:
   *              type: boolean
   *          - name: option
   *            in: query
   *            description: xss option
   *            schema:
   *              type: number
   *          - name: tagWhiteList
   *            in: query
   *            description: custom tag whitelist
   *            schema:
   *              type: array
   *              items:
   *                type: string
   *                description: tag whitelist
   *          - name: attrWhiteList
   *            in: query
   *            description: custom attr whitelist
   *            schema:
   *              type: array
   *              items:
   *                type: string
   *                description: tag whitelist
   *        responses:
   *          200:
   *            description: Updating xss success
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    xssParams:
   *                      type: object
   *                      description: new xss params
   */
  router.put('/xss', loginRequiredStrictly, adminRequired, csrf, validator.xssSetting, ApiV3FormValidator, async(req, res) => {
    if (req.body.isEnabledXss && req.body.xssOption == null) {
      return res.apiv3Err(new ErrorV3('xss option is required'));
    }

    const xssParams = {
      'markdown:xss:isEnabledPrevention': req.body.isEnabledXss,
      'markdown:xss:option': req.body.xssOption,
      'markdown:xss:tagWhiteList': req.body.tagWhiteList,
      'markdown:xss:attrWhiteList': req.body.attrWhiteList,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('markdown', xssParams);
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
