/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:personal-setting');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');
const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: PsersonalSetting
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      PersonalSettings:
 *        description: personal settings
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *          lang:
 *            type: string
 *          isEmailPublished:
 *            type: boolean
 */
module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { User, ExternalAccount } = crowi.models;


  const { ApiV3FormValidator } = crowi.middlewares;

  const validator = {
    personal: [
      body('name').isString().not().isEmpty(),
      body('email').isEmail(),
      body('lang').isString().isIn(['en-US', 'ja']),
      body('isEmailPublished').isBoolean(),
    ],
  };

  /**
   * @swagger
   *
   *    /personal-setting:
   *      get:
   *        tags: [PersonalSetting]
   *        operationId: getPersonalSetting
   *        summary: /personal-setting
   *        description: Get personal parameters
   *        responses:
   *          200:
   *            description: params of personal
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    currentUser:
   *                      type: object
   *                      description: personal params
   */
  router.get('/', loginRequiredStrictly, async(req, res) => {
    const currentUser = await User.findUserByUsername(req.user.username);
    return res.apiv3({ currentUser });
  });

  /**
   * @swagger
   *
   *    /personal-setting:
   *      put:
   *        tags: [PersonalSetting]
   *        operationId: updatePersonalSetting
   *        summary: /personal-setting
   *        description: Update personal setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/PersonalSettings'
   *        responses:
   *          200:
   *            description: params of personal
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    currentUser:
   *                      type: object
   *                      description: personal params
   */
  router.put('/', loginRequiredStrictly, csrf, validator.personal, ApiV3FormValidator, async(req, res) => {
    const {
      name, email, lang, isEmailPublished,
    } = req.body;

    try {
      const user = await User.findOne({ email });
      user.name = name;
      user.email = email;
      user.lang = lang;
      user.isEmailPublished = isEmailPublished;

      const updatedUser = await user.save();
      req.i18n.changeLanguage(lang);
      return res.apiv3({ updatedUser });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err('update-personal-settings-failed');
    }

  });

  /**
   * @swagger
   *
   *    /personal-setting/external-accounts:
   *      get:
   *        tags: [PersonalSetting]
   *        operationId: getExternalAccounts
   *        summary: /personal-setting/external-accounts
   *        description: Get external accounts that linked current user
   *        responses:
   *          200:
   *            description: external accounts
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    externalAccounts:
   *                      type: object
   *                      description: array of external accounts
   */
  router.get('/external-accounts', loginRequiredStrictly, async(req, res) => {
    const userData = req.user;

    try {
      const externalAccounts = await ExternalAccount.find({ user: userData });
      return res.apiv3({ externalAccounts });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err('get-external-accounts-failed');
    }

  });

  return router;
};
