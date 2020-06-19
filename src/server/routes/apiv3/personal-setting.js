/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:personal-setting');

const express = require('express');

const passport = require('passport');

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
 *      Passwords:
 *        description: passwords for update
 *        type: object
 *        properties:
 *          oldPassword:
 *            type: string
 *          newPassword:
 *            type: string
 *          newPasswordConfirm:
 *            type: string
 *      AssociateUser:
 *        description: Ldap account for associate
 *        type: object
 *        properties:
 *          username:
 *            type: string
 *          password:
 *            type: string
 *      DisassociateUser:
 *        description: Ldap account for disassociate
 *        type: object
 *        properties:
 *          providerType:
 *            type: string
 *          accountId:
 *            type: string
 */
module.exports = (crowi) => {
  const accessTokenParser = require('../../middleware/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { User, ExternalAccount } = crowi.models;


  const { ApiV3FormValidator } = crowi.middlewares;

  const validator = {
    personal: [
      body('name').isString().not().isEmpty(),
      body('email').isEmail(),
      body('lang').isString().isIn(crowi.locales),
      body('isEmailPublished').isBoolean(),
    ],
    imageType: [
      body('isGravatarEnabled').isBoolean(),
    ],
    password: [
      body('oldPassword').isString(),
      body('newPassword').isString().not().isEmpty()
        .isLength({ min: 6 })
        .withMessage('password must be at least 6 characters long'),
      body('newPasswordConfirm').isString().not().isEmpty()
        .custom((value, { req }) => {
          return (value === req.body.newPassword);
        }),
    ],
    associateLdap: [
      body('username').isString().not().isEmpty(),
      body('password').isString().not().isEmpty(),
    ],
    disassociateLdap: [
      body('providerType').isString().not().isEmpty(),
      body('accountId').isString().not().isEmpty(),
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
  router.get('/', accessTokenParser, loginRequiredStrictly, async (req, res) => {
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
  router.put('/', accessTokenParser, loginRequiredStrictly, csrf, validator.personal, ApiV3FormValidator, async (req, res) => {

    try {
      const user = await User.findOne({ _id: req.user.id });
      user.name = req.body.name;
      user.email = req.body.email;
      user.lang = req.body.lang;
      user.isEmailPublished = req.body.isEmailPublished;

      const updatedUser = await user.save();
      req.i18n.changeLanguage(req.body.lang);
      return res.apiv3({ updatedUser });
    } catch (err) {
      logger.error(err);
      return res.apiv3Err('update-personal-settings-failed');
    }

  });

  /**
   * @swagger
   *
   *    /personal-setting/image-type:
   *      put:
   *        tags: [PersonalSetting]
   *        operationId: putUserImageType
   *        summary: /personal-setting/image-type
   *        description: Update user image type
   *        responses:
   *          200:
   *            description: succeded to update user image type
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userData:
   *                      type: object
   *                      description: user data
   */
  router.put('/image-type', accessTokenParser, loginRequiredStrictly, csrf, validator.imageType, ApiV3FormValidator, async (req, res) => {
    const { isGravatarEnabled } = req.body;

    try {
      const userData = await req.user.updateIsGravatarEnabled(isGravatarEnabled);
      return res.apiv3({ userData });
    } catch (err) {
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
  router.get('/external-accounts', accessTokenParser, loginRequiredStrictly, async (req, res) => {
    const userData = req.user;

    try {
      const externalAccounts = await ExternalAccount.find({ user: userData });
      return res.apiv3({ externalAccounts });
    } catch (err) {
      logger.error(err);
      return res.apiv3Err('get-external-accounts-failed');
    }

  });

  /**
   * @swagger
   *
   *    /personal-setting/password:
   *      put:
   *        tags: [PersonalSetting]
   *        operationId: putUserPassword
   *        summary: /personal-setting/password
   *        description: Update user password
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/Passwords'
   *        responses:
   *          200:
   *            description: user password
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userData:
   *                      type: object
   *                      description: user data updated
   */
  router.put('/password', accessTokenParser, loginRequiredStrictly, csrf, validator.password, ApiV3FormValidator, async (req, res) => {
    const { body, user } = req;
    const { oldPassword, newPassword } = body;

    if (user.isPasswordSet() && !user.isPasswordValid(oldPassword)) {
      return res.apiv3Err('wrong-current-password', 400);
    }
    try {
      const userData = await user.updatePassword(newPassword);
      return res.apiv3({ userData });
    } catch (err) {
      logger.error(err);
      return res.apiv3Err('update-password-failed');
    }

  });

  /**
   * @swagger
   *
   *    /personal-setting/api-token:
   *      put:
   *        tags: [PersonalSetting]
   *        operationId: putUserApiToken
   *        summary: /personal-setting/api-token
   *        description: Update user api token
   *        responses:
   *          200:
   *            description: succeded to update user api token
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    userData:
   *                      type: object
   *                      description: user data
   */
  router.put('/api-token', loginRequiredStrictly, csrf, async (req, res) => {
    const { user } = req;

    try {
      const userData = await user.updateApiToken();
      return res.apiv3({ userData });
    } catch (err) {
      logger.error(err);
      return res.apiv3Err('update-api-token-failed');
    }

  });

  /**
   * @swagger
   *
   *    /personal-setting/associate-ldap:
   *      put:
   *        tags: [PersonalSetting]
   *        operationId: associateLdapAccount
   *        summary: /personal-setting/associate-ldap
   *        description: associate Ldap account
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/AssociateUser'
   *        responses:
   *          200:
   *            description: succeded to associate Ldap account
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    associateUser:
   *                      type: object
   *                      description: Ldap account associate to me
   */
  router.put('/associate-ldap', accessTokenParser, loginRequiredStrictly, csrf, validator.associateLdap, ApiV3FormValidator, async (req, res) => {
    const { passportService } = crowi;
    const { user, body } = req;
    const { username } = body;

    if (!passportService.isLdapStrategySetup) {
      logger.error('LdapStrategy has not been set up');
      return res.apiv3Err('associate-ldap-account-failed', 405);
    }

    try {
      await passport.authenticate('ldapauth');
      const associateUser = await ExternalAccount.associate('ldap', username, user);
      return res.apiv3({ associateUser });
    } catch (err) {
      logger.error(err);
      return res.apiv3Err('associate-ldap-account-failed');
    }

  });

  /**
   * @swagger
   *
   *    /personal-setting/disassociate-ldap:
   *      put:
   *        tags: [PersonalSetting]
   *        operationId: disassociateLdapAccount
   *        summary: /personal-setting/disassociate-ldap
   *        description: disassociate Ldap account
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/DisassociateUser'
   *        responses:
   *          200:
   *            description: succeded to disassociate Ldap account
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    disassociateUser:
   *                      type: object
   *                      description: Ldap account disassociate to me
   */
  router.put('/disassociate-ldap', accessTokenParser, loginRequiredStrictly, csrf, validator.disassociateLdap, ApiV3FormValidator, async (req, res) => {
    const { user, body } = req;
    const { providerType, accountId } = body;

    try {
      const count = await ExternalAccount.count({ user });
      // make sure password set or this user has two or more ExternalAccounts
      if (user.password == null && count <= 1) {
        return res.apiv3Err('disassociate-ldap-account-failed');
      }
      const disassociateUser = await ExternalAccount.findOneAndRemove({ providerType, accountId, user });
      return res.apiv3({ disassociateUser });
    } catch (err) {
      logger.error(err);
      return res.apiv3Err('disassociate-ldap-account-failed');
    }

  });

  return router;
};
