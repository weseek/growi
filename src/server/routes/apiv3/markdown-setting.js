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

  validator.presentationSetting = [
    // body('').isBoolean(),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/markdown-setting/presentation:
   *      put:
   *        tags: [MarkDownSetting]
   *        description: Update presentation
   *        parameters:
   *          - name: markdown:presentation:isEnabledPresentation
   *            in: query
   *            description: enable presentation
   *            schema:
   *              type: boolean
   *          - name: markdown:presentation:option
   *            in: query
   *            description: presentation option
   *            schema:
   *              type: boolean
   *        responses:
   *          200:
   *            description: Updating presentation success
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    presentationParams:
   *                      type: object
   *                      description: new presentation params
   */
  router.put('/presentation', loginRequiredStrictly, adminRequired, csrf, validator.presentationSetting, ApiV3FormValidator, async(req, res) => {
    if (req.body.isEnabledXss && req.body.presentationOption == null) {
      return res.apiv3Err(new ErrorV3('presentation option is required'));
    }

    const presentationParams = {
      'markdown:presentation:isEnabledPresentation': req.body.isEnabledPresentation,
      'markdown:presentation:option': req.body.presentationOption,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('markdown', presentationParams);
      return res.apiv3({ presentationParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating presentation';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-presentation-failed'));
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
   *        tags: [Users]
   *        description: Update xss
   *        parameters:
   *          - name: markdown:xss:isEnabledPrevention
   *            in: query
   *            description: enable xss
   *            schema:
   *              type: boolean
   *          - name: markdown:xss:option
   *            in: query
   *            description: xss option
   *            schema:
   *              type: number
   *          - name: markdown:xss:tagWhiteList
   *            in: query
   *            description: custom tag whitelist
   *            schema:
   *              type: array
   *              items:
   *                type: string
   *                description: tag whitelist
   *          - name: markdown:xss:attrWhiteList
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
