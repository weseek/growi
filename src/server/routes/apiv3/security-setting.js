/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:security-setting');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');
const ErrorV3 = require('../../models/vo/error-apiv3');

const validator = {
  // TODO correct validator
  generalSetting: [
    body('restrictGuestMode').isString(),
    body('pageCompleteDeletionAuthority').isString(),
    body('hideRestrictedByOwner').isBoolean(),
    body('hideRestrictedByGroup').isBoolean(),
  ],
  basicAuth: [
    body('isSameUsernameTreatedAsIdenticalUser').isBoolean(),
  ],
  googleOAuth: [
    body('googleClientId').isString(),
    body('googleClientSecret').isString(),
    body('isSameUsernameTreatedAsIdenticalUser').isBoolean(),
  ],
  githubOAuth: [
    body('githubClientId').isString(),
    body('githubClientSecret').isString(),
    body('isSameUsernameTreatedAsIdenticalUser').isBoolean(),
  ],
  twitterOAuth: [
    body('twitterConsumerKey').isString(),
    body('twitterConsumerSecret').isString(),
    body('isSameUsernameTreatedAsIdenticalUser').isBoolean(),
  ],
};

/**
 * @swagger
 *  tags:
 *    name: SecuritySetting
 */


/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      SecurityParams:
 *        type: object
 *          GeneralSetting:
 *            type:object
 *              GuestModeParams:
 *                type: object
 *                properties:
 *                  restrictGuestMode:
 *                    type: string
 *                    description: type of restrictGuestMode
 *              PageDeletionParams:
 *                type: object
 *                properties:
 *                  pageCompleteDeletionAuthority:
 *                    type: string
 *                    description: type of pageDeletionAuthority
 *              Function:
 *                type: object
 *                properties:
 *                  hideRestrictedByOwner:
 *                    type: boolean
 *                    description: enable hide by owner
 *                  hideRestrictedByGroup:
 *                    type: boolean
 *                    description: enable hide by group
 *          OidcAuthSetting:
 *            type:object
 *              oidcProviderName:
 *                type: string
 *                description: provider name for oidc
 *              oidcIssuerHost:
 *                type: string
 *                description: issuer host for oidc
 *              oidcClientId:
 *                type: string
 *                description: client id for oidc
 *              oidcClientSecret:
 *                type: string
 *                description: client secret for oidc
 *              oidcAttrMapId:
 *                type: string
 *                description: attr map id for oidc
 *              oidcAttrMapUserName:
 *                type: string
 *                description: attr map username for oidc
 *              oidcAttrMapName:
 *                type: string
 *                description: attr map name for oidc
 *              oidcAttrMapMail:
 *                type: string
 *                description: attr map mail for oidc
 *              isSameUsernameTreatedAsIdenticalUser
 *                type: boolean
 *                description: local account automatically linked the user name matched
 *              isSameEmailTreatedAsIdenticalUser
 *                type: boolean
 *                description: local account automatically linked the email matched
 *          BasicAuthSetting:
 *            type:object
 *              isSameUsernameTreatedAsIdenticalUser
 *                type: boolean
 *                description: local account automatically linked the email matched
 *          GitHubOAuthSetting:
 *            type:object
 *              githubClientId:
 *                type: string
 *                description: key of comsumer
 *              githubClientSecret:
 *                type: string
 *                description: password of comsumer
 *              isSameUsernameTreatedAsIdenticalUser
 *                type: boolean
 *                description: local account automatically linked the email matched
 *          GoogleOAuthSetting:
 *            type:object
 *              googleClientId:
 *                type: string
 *                description: key of comsumer
 *              googleClientSecret:
 *                type: string
 *                description: password of comsumer
 *              isSameUsernameTreatedAsIdenticalUser
 *                type: boolean
 *                description: local account automatically linked the email matched
 *          TwitterOAuthSetting:
 *            type:object
 *              twitterConsumerKey:
 *                type: string
 *                description: key of comsumer
 *              twitterConsumerSecret:
 *                type: string
 *                description: password of comsumer
 *              isSameUsernameTreatedAsIdenticalUser
 *                type: boolean
 *                description: local account automatically linked the email matched
 */
module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { ApiV3FormValidator } = crowi.middlewares;

  /**
   * @swagger
   *
   *    /security-setting/:
   *      get:
   *        tags: [SecuritySetting]
   *        description: Get security paramators
   *        responses:
   *          200:
   *            description: params of security
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    securityParams:
   *                      $ref: '#/components/schemas/SecurityParams'
   */
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {

    const securityParams = {
      generalAuth: {
        isOidcEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:isEnabled'),
        isBasicEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-basic:isEnabled'),
        isGoogleOAuthEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-google:isEnabled'),
        isGithubOAuthEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-github:isEnabled'),
        isTwitterOAuthEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:isEnabled'),
      },
      oidcAuth: {
        oidcProviderName: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:providerName'),
        oidcIssuerHost: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:issuerHost'),
        oidcClientId: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:clientId'),
        oidcClientSecret: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:clientSecret'),
        oidcAttrMapId: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:attrMapId'),
        oidcAttrMapUserName: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:attrMapUserName'),
        oidcAttrMapName: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:attrMapName'),
        oidcAttrMapEmail: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:attrMapMail'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:isSameUsernameTreatedAsIdenticalUser'),
        isSameEmailTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:isSameEmailTreatedAsIdenticalUser'),
      },
      basicAuth: {
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-basic:isSameUsernameTreatedAsIdenticalUser'),
      },
      googleOAuth: {
        googleClientId: await crowi.configManager.getConfig('crowi', 'security:passport-google:clientId'),
        googleClientSecret: await crowi.configManager.getConfig('crowi', 'security:passport-google:clientSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-google:isSameUsernameTreatedAsIdenticalUser'),
      },
      githubOAuth: {
        githubClientId: await crowi.configManager.getConfig('crowi', 'security:passport-github:clientId'),
        githubClientSecret: await crowi.configManager.getConfig('crowi', 'security:passport-github:clientSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-github:isSameUsernameTreatedAsIdenticalUser'),
      },
      twitterOAuth: {
        twitterConsumerKey: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:consumerKey'),
        twitterConsumerSecret: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:consumerSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:isSameUsernameTreatedAsIdenticalUser'),
      },
    };

    return res.apiv3({ securityParams });
  });

  /**
   * @swagger
   *
   *    /security-setting/general-setting:
   *      put:
   *        tags: [SecuritySetting]
   *        description: Update GeneralSetting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  restrictGuestMode:
   *                    description: type of restrictGuestMode
   *                    type: string
   *                  pageCompleteDeletionAuthority:
   *                    type: string
   *                    description: type of pageDeletionAuthority
   *                  hideRestrictedByOwner:
   *                    type: boolean
   *                    description: enable hide by owner
   *                  hideRestrictedByGroup:
   *                    type: boolean
   *                    description: enable hide by group
   *        responses:
   *          200:
   *            description: Succeeded to update general Setting
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    status:
   *                      $ref: '#/components/schemas/SecurityParams/GeneralSetting'
   */
  router.put('/general-setting', loginRequiredStrictly, adminRequired, csrf, validator.generalSetting, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:restrictGuestMode': req.body.restrictGuestMode,
      'security:pageCompleteDeletionAuthority': req.body.pageCompleteDeletionAuthority,
      'security:list-policy:hideRestrictedByOwner': req.body.hideRestrictedByOwner,
      'security:list-policy:hideRestrictedByGroup': req.body.hideRestrictedByGroup,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const securitySettingParams = {
        restrictGuestMode: await crowi.configManager.getConfig('crowi', 'security:restrictGuestMode'),
        pageCompleteDeletionAuthority: await crowi.configManager.getConfig('crowi', 'security:pageCompleteDeletionAuthority'),
        hideRestrictedByOwner: await crowi.configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByOwner'),
        hideRestrictedByGroup: await crowi.configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByGroup'),
      };
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating security setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-secuirty-setting failed'));
    }
  });

  /**
   * @swagger
   *
   *    /security-setting/basic:
   *      put:
   *        tags: [SecuritySetting]
   *        description: Update basic
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SecurityParams/BasicAuthSetting'
   *        responses:
   *          200:
   *            description: Succeeded to update basic
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/SecurityParams/BasicAuthSetting'
   */
  router.put('/basic', loginRequiredStrictly, adminRequired, csrf, validator.basicAuth, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-basic:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const securitySettingParams = {
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-basic:isSameUsernameTreatedAsIdenticalUser'),
      };
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating basicAuth';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-basicOAuth-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /security-setting/google-oauth:
   *      put:
   *        tags: [SecuritySetting]
   *        description: Update google OAuth
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SecurityParams/GoogleOAuthSetting'
   *        responses:
   *          200:
   *            description: Succeeded to google OAuth
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/SecurityParams/GoogleOAuthSetting'
   */
  router.put('/google-oauth', loginRequiredStrictly, adminRequired, csrf, validator.googleOAuth, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-google:clientId': req.body.googleClientId,
      'security:passport-google:clientSecret': req.body.googleClientSecret,
      'security:passport-google:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const securitySettingParams = {
        googleClientId: await crowi.configManager.getConfig('crowi', 'security:passport-google:clientId'),
        googleClientSecret: await crowi.configManager.getConfig('crowi', 'security:passport-google:clientSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-google:isSameUsernameTreatedAsIdenticalUser'),
      };
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating googleOAuth';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-googleOAuth-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /security-setting/github-oauth:
   *      put:
   *        tags: [SecuritySetting]
   *        description: Update github OAuth
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SecurityParams/GitHubOAuthSetting'
   *        responses:
   *          200:
   *            description: Succeeded to github OAuth
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/SecurityParams/GitHubOAuthSetting'
   */
  router.put('/github-oauth', loginRequiredStrictly, adminRequired, csrf, validator.githubOAuth, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-github:clientId': req.body.githubClientId,
      'security:passport-github:clientSecret': req.body.githubClientSecret,
      'security:passport-github:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const securitySettingParams = {
        githubClientId: await crowi.configManager.getConfig('crowi', 'security:passport-github:clientId'),
        githubClientSecret: await crowi.configManager.getConfig('crowi', 'security:passport-github:clientSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-github:isSameUsernameTreatedAsIdenticalUser'),
      };
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating githubOAuth';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-githubOAuth-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /security-setting/twitter-oauth:
   *      put:
   *        tags: [SecuritySetting]
   *        description: Update twitter OAuth
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SecurityParams/TwitterOAuthSetting'
   *        responses:
   *          200:
   *            description: Succeeded to update twitter OAuth
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/SecurityParams/TwitterOAuthSetting'
   */
  router.put('/twitter-oauth', loginRequiredStrictly, adminRequired, csrf, validator.twitterOAuth, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-twitter:consumerKey': req.body.twitterConsumerKey,
      'security:passport-twitter:consumerSecret': req.body.twitterConsumerSecret,
      'security:passport-twitter:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const securitySettingParams = {
        twitterConsumerId: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:consumerKey'),
        twitterConsumerSecret: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:consumerSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:isSameUsernameTreatedAsIdenticalUser'),
      };
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating twitterOAuth';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-twitterOAuth-failed'));
    }
  });

  return router;
};
