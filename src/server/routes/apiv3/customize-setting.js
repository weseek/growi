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
 *    name: CustomizeSetting
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

  validator.layoutTheme = [
    body('layoutType').isString(),
    body('themeType').isString(),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /_api/v3/customize-setting/layoutTheme:
   *      put:
   *        tags: [CustomizeSetting]
   *        description: Update layout and theme
   *        parameters:
   *          - name: layoutType
   *            in: query
   *            description: type of layout
   *            schema:
   *              type: string
   *          - name: themeType
   *            in: query
   *            description: type of theme
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Succeeded to update layout and theme
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    customizeParams:
   *                      type: object
   *                      description: new params of layout and theme
   */
  router.put('/layoutTheme', loginRequiredStrictly, adminRequired, csrf, validator.layoutTheme, ApiV3FormValidator, async(req, res) => {
    const customizeParams = {
      'customize:layout': req.body.layoutType,
      'customize:theme': req.body.themeType,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', customizeParams);
      return res.apiv3({ customizeParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating presentation';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-presentation-failed'));
    }
  });

  return router;
};
