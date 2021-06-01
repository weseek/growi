import ShareLink from '~/server/models/share-link';

import loggerFactory from '~/utils/logger';
import { removeNullPropertyFromObject } from '~/utils/object-utils';

const logger = loggerFactory('growi:routes:apiv3:security-setting');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator');
const ErrorV3 = require('../../models/vo/error-apiv3');

const validator = {
  generalSetting: [
    body('sessionMaxAge').optional({ checkFalsy: true }).trim().isInt(),
    body('restrictGuestMode').if(value => value != null).isString().isIn([
      'Deny', 'Readonly',
    ]),
    body('pageCompleteDeletionAuthority').if(value => value != null).isString().isIn([
      'anyOne', 'adminOnly', 'adminAndAuthor',
    ]),
    body('hideRestrictedByOwner').if(value => value != null).isBoolean(),
    body('hideRestrictedByGroup').if(value => value != null).isBoolean(),
  ],
  authenticationSetting: [
    body('isEnabled').if(value => value != null).isBoolean(),
    body('authId').isString().isIn([
      'local', 'ldap', 'saml', 'oidc', 'basic', 'google', 'github', 'twitter',
    ]),
  ],
  localSetting: [
    body('registrationMode').isString().isIn([
      'Open', 'Restricted', 'Closed',
    ]),
    body('registrationWhiteList').if(value => value != null).isArray().customSanitizer((value, { req }) => {
      return value.filter(email => email !== '');
    }),
  ],
  ldapAuth: [
    body('serverUrl').if(value => value != null).isString(),
    body('isUserBind').if(value => value != null).isBoolean(),
    body('ldapBindDN').if(value => value != null).isString(),
    body('ldapBindDNPassword').if(value => value != null).isString(),
    body('ldapSearchFilter').if(value => value != null).isString(),
    body('ldapAttrMapUsername').if(value => value != null).isString(),
    body('isSameUsernameTreatedAsIdenticalUser').if(value => value != null).isBoolean(),
    body('ldapAttrMapMail').if(value => value != null).isString(),
    body('ldapAttrMapName').if(value => value != null).isString(),
    body('ldapGroupSearchBase').if(value => value != null).isString(),
    body('ldapGroupSearchFilter').if(value => value != null).isString(),
    body('ldapGroupDnProperty').if(value => value != null).isString(),
  ],
  samlAuth: [
    body('entryPoint').if(value => value != null).isString(),
    body('issuer').if(value => value != null).isString(),
    body('cert').if(value => value != null).isString(),
    body('attrMapId').if(value => value != null).isString(),
    body('attrMapUsername').if(value => value != null).isString(),
    body('attrMapMail').if(value => value != null).isString(),
    body('attrMapFirstName').if(value => value != null).isString(),
    body('attrMapLastName').if(value => value != null).isString(),
    body('isSameUsernameTreatedAsIdenticalUser').if(value => value != null).isBoolean(),
    body('isSameEmailTreatedAsIdenticalUser').if(value => value != null).isBoolean(),
    body('ABLCRule').if(value => value != null).isString(),
  ],
  oidcAuth: [
    body('oidcProviderName').if(value => value != null).isString(),
    body('oidcIssuerHost').if(value => value != null).isString(),
    body('oidcAuthorizationEndpoint').if(value => value != null).isString(),
    body('oidcTokenEndpoint').if(value => value != null).isString(),
    body('oidcRevocationEndpoint').if(value => value != null).isString(),
    body('oidcIntrospectionEndpoint').if(value => value != null).isString(),
    body('oidcUserInfoEndpoint').if(value => value != null).isString(),
    body('oidcEndSessionEndpoint').if(value => value != null).isString(),
    body('oidcRegistrationEndpoint').if(value => value != null).isString(),
    body('oidcJWKSUri').if(value => value != null).isString(),
    body('oidcClientId').if(value => value != null).isString(),
    body('oidcClientSecret').if(value => value != null).isString(),
    body('oidcAttrMapId').if(value => value != null).isString(),
    body('oidcAttrMapUserName').if(value => value != null).isString(),
    body('oidcAttrMapEmail').if(value => value != null).isString(),
    body('isSameUsernameTreatedAsIdenticalUser').if(value => value != null).isBoolean(),
    body('isSameEmailTreatedAsIdenticalUser').if(value => value != null).isBoolean(),
  ],
  basicAuth: [
    body('isSameUsernameTreatedAsIdenticalUser').if(value => value != null).isBoolean(),
  ],
  googleOAuth: [
    body('googleClientId').if(value => value != null).isString(),
    body('googleClientSecret').if(value => value != null).isString(),
    body('isSameUsernameTreatedAsIdenticalUser').if(value => value != null).isBoolean(),
  ],
  githubOAuth: [
    body('githubClientId').if(value => value != null).isString(),
    body('githubClientSecret').if(value => value != null).isString(),
    body('isSameUsernameTreatedAsIdenticalUser').if(value => value != null).isBoolean(),
  ],
  twitterOAuth: [
    body('twitterConsumerKey').if(value => value != null).isString(),
    body('twitterConsumerSecret').if(value => value != null).isString(),
    body('isSameUsernameTreatedAsIdenticalUser').if(value => value != null).isBoolean(),
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
 *      GeneralSetting:
 *        type: object
 *        properties:
 *          restrictGuestMode:
 *            type: string
 *            description: type of restrictGuestMode
 *          pageCompleteDeletionAuthority:
 *            type: string
 *            description: type of pageDeletionAuthority
 *          hideRestrictedByOwner:
 *            type: boolean
 *            description: enable hide by owner
 *          hideRestrictedByGroup:
 *            type: boolean
 *            description: enable hide by group
 *      LocalSetting:
 *        type: object
 *        properties:
 *          isLocalEnabled:
 *            type: boolean
 *            description: local setting mode
 *          registrationMode:
 *            type: string
 *            description: type of registrationMode
 *          registrationWhiteList:
 *            type: array
 *            description: array of regsitrationList
 *            items:
 *              type: string
 *              description: registration whiteList
 *      LdapAuthSetting:
 *        type: object
 *        properties:
 *          serverUrl:
 *            type: string
 *            description: server url for ldap
 *          isUserBind:
 *            type: boolean
 *            description: enable user bind
 *          ldapBindDN:
 *            type: string
 *            description: the query used to bind with the directory service
 *          ldapBindDNPassword:
 *            type: string
 *            description: the password that is entered in the login page will be used to bind
 *          ldapSearchFilter:
 *            type: string
 *            description: the query used to locate the authenticated user
 *          ldapAttrMapUsername:
 *            type: string
 *            description: specification of mappings for username when creating new users
 *          isSameUsernameTreatedAsIdenticalUser:
 *            type: boolean
 *            description: local account automatically linked the user name matched
 *          ldapAttrMapMail:
 *            type: string
 *            description: specification of mappings for mail address when creating new users
 *          ldapAttrMapName:
 *            type: string
 *            description: Specification of mappings for full name address when creating new users
 *          ldapGroupSearchBase:
 *            type: string
 *            description: the base DN from which to search for groups.
 *          ldapGroupSearchFilter:
 *            type: string
 *            description: the query used to filter for groups
 *          ldapGroupDnProperty:
 *            type: string
 *            description: The property of user object to use in dn interpolation of Group Search Filter
 *      SamlAuthSetting:
 *        type: object
 *        properties:
 *          samlEntryPoint:
 *            type: string
 *            description: entry point for saml
 *          samlIssuer:
 *            type: string
 *            description: issuer for saml
 *          samlCert:
 *            type: string
 *            description: certificate for saml
 *          samlAttrMapId:
 *            type: string
 *            description: attribute mapping id for saml
 *          samlAttrMapUserName:
 *            type: string
 *            description: attribute mapping user name for saml
 *          samlAttrMapMail:
 *            type: string
 *            description: attribute mapping mail for saml
 *          samlAttrMapFirstName:
 *            type: string
 *            description: attribute mapping first name for saml
 *          samlAttrMapLastName:
 *            type: string
 *            description: attribute mapping last name for saml
 *          isSameUsernameTreatedAsIdenticalUser:
 *            type: boolean
 *            description: local account automatically linked the user name matched
 *          isSameEmailTreatedAsIdenticalUser:
 *            type: boolean
 *            description: local account automatically linked the email matched
 *          samlABLCRule:
 *            type: string
 *            description: ABLCRule for saml
 *      OidcAuthSetting:
 *        type: object
 *        properties:
 *          oidcProviderName:
 *            type: string
 *            description: provider name for oidc
 *          oidcIssuerHost:
 *            type: string
 *            description: issuer host for oidc
 *          oidcAuthorizationEndpoint:
 *            type: string
 *            description: authorization endpoint for oidc
 *          oidcTokenEndpoint:
 *            type: string
 *            description: token endpoint for oidc
 *          oidcRevocationEndpoint:
 *            type: string
 *            description: revocation endpoint for oidc
 *          oidcIntrospectionEndpoint:
 *            type: string
 *            description: introspection endpoint for oidc
 *          oidcUserInfoEndpoint:
 *            type: string
 *            description: userinfo endpoint for oidc
 *          oidcEndSessionEndpoint:
 *            type: string
 *            description: end session endpoint for oidc
 *          oidcRegistrationEndpoint:
 *            type: string
 *            description: registration endpoint for oidc
 *          oidcJWKSUri:
 *            type: string
 *            description: JSON Web Key Set URI for oidc
 *          oidcClientId:
 *            type: string
 *            description: client id for oidc
 *          oidcClientSecret:
 *            type: string
 *            description: client secret for oidc
 *          oidcAttrMapId:
 *            type: string
 *            description: attr map id for oidc
 *          oidcAttrMapUserName:
 *            type: string
 *            description: attr map username for oidc
 *          oidcAttrMapName:
 *            type: string
 *            description: attr map name for oidc
 *          oidcAttrMapMail:
 *            type: string
 *            description: attr map mail for oidc
 *          isSameUsernameTreatedAsIdenticalUser:
 *            type: boolean
 *            description: local account automatically linked the user name matched
 *          isSameEmailTreatedAsIdenticalUser:
 *            type: boolean
 *            description: local account automatically linked the email matched
 *      BasicAuthSetting:
 *        type: object
 *        properties:
 *          isSameUsernameTreatedAsIdenticalUser:
 *            type: boolean
 *            description: local account automatically linked the email matched
 *      GitHubOAuthSetting:
 *        type: object
 *        properties:
 *          githubClientId:
 *            type: string
 *            description: key of comsumer
 *          githubClientSecret:
 *            type: string
 *            description: password of comsumer
 *          isSameUsernameTreatedAsIdenticalUser:
 *            type: boolean
 *            description: local account automatically linked the email matched
 *      GoogleOAuthSetting:
 *        type: object
 *        properties:
 *          googleClientId:
 *            type: string
 *            description: key of comsumer
 *          googleClientSecret:
 *            type: string
 *            description: password of comsumer
 *          isSameUsernameTreatedAsIdenticalUser:
 *            type: boolean
 *            description: local account automatically linked the email matched
 *      TwitterOAuthSetting:
 *        type: object
 *        properties:
 *          twitterConsumerKey:
 *            type: string
 *            description: key of comsumer
 *          twitterConsumerSecret:
 *            type: string
 *            description: password of comsumer
 *          isSameUsernameTreatedAsIdenticalUser:
 *            type: boolean
 *            description: local account automatically linked the email matched
 */
module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  async function updateAndReloadStrategySettings(authId, params) {
    const { configManager, passportService } = crowi;

    // update config without publishing S2sMessage
    await configManager.updateConfigsInTheSameNamespace('crowi', params, true);

    await passportService.setupStrategyById(authId);
    passportService.publishUpdatedMessage(authId);
  }

  /**
   * @swagger
   *
   *    /_api/v3/security-setting/:
   *      get:
   *        tags: [SecuritySetting, apiv3]
   *        description: Get security paramators
   *        responses:
   *          200:
   *            description: params of security
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    securityParams:
   *                      type: object
   *                      description: security params
   */
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {

    const securityParams = {
      generalSetting: {
        restrictGuestMode: await crowi.configManager.getConfig('crowi', 'security:restrictGuestMode'),
        pageCompleteDeletionAuthority: await crowi.configManager.getConfig('crowi', 'security:pageCompleteDeletionAuthority'),
        hideRestrictedByOwner: await crowi.configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByOwner'),
        hideRestrictedByGroup: await crowi.configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByGroup'),
        wikiMode: await crowi.configManager.getConfig('crowi', 'security:wikiMode'),
        sessionMaxAge: await crowi.configManager.getConfig('crowi', 'security:sessionMaxAge'),
      },
      localSetting: {
        useOnlyEnvVarsForSomeOptions: await crowi.configManager.getConfig('crowi', 'security:passport-local:useOnlyEnvVarsForSomeOptions'),
        registrationMode: await crowi.configManager.getConfig('crowi', 'security:registrationMode'),
        registrationWhiteList: await crowi.configManager.getConfig('crowi', 'security:registrationWhiteList'),
      },
      generalAuth: {
        isLocalEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-local:isEnabled'),
        isLdapEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:isEnabled'),
        isSamlEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-saml:isEnabled'),
        isOidcEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:isEnabled'),
        isBasicEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-basic:isEnabled'),
        isGoogleEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-google:isEnabled'),
        isGitHubEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-github:isEnabled'),
        isTwitterEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:isEnabled'),
      },
      ldapAuth: {
        serverUrl: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:serverUrl'),
        isUserBind: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:isUserBind'),
        ldapBindDN: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:bindDN'),
        ldapBindDNPassword: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:bindDNPassword'),
        ldapSearchFilter: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:searchFilter'),
        ldapAttrMapUsername: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:attrMapUsername'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:isSameUsernameTreatedAsIdenticalUser'),
        ldapAttrMapMail: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:attrMapMail'),
        ldapAttrMapName: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:attrMapName'),
        ldapGroupSearchBase: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:groupSearchBase'),
        ldapGroupSearchFilter: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:groupSearchFilter'),
        ldapGroupDnProperty: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:groupDnProperty'),
      },
      samlAuth: {
        missingMandatoryConfigKeys: await crowi.passportService.getSamlMissingMandatoryConfigKeys(),
        useOnlyEnvVarsForSomeOptions: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:useOnlyEnvVarsForSomeOptions'),
        samlEntryPoint: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:entryPoint'),
        samlEnvVarEntryPoint: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:entryPoint'),
        samlIssuer: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:issuer'),
        samlEnvVarIssuer: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:issuer'),
        samlCert: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:cert'),
        samlEnvVarCert: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:cert'),
        samlAttrMapId: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapId'),
        samlEnvVarAttrMapId: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapId'),
        samlAttrMapUsername: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapUsername'),
        samlEnvVarAttrMapUsername: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapUsername'),
        samlAttrMapMail: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapMail'),
        samlEnvVarAttrMapMail: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapMail'),
        samlAttrMapFirstName: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapFirstName'),
        samlEnvVarAttrMapFirstName: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapFirstName'),
        samlAttrMapLastName: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapLastName'),
        samlEnvVarAttrMapLastName: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapLastName'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-saml:isSameUsernameTreatedAsIdenticalUser'),
        isSameEmailTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-saml:isSameEmailTreatedAsIdenticalUser'),
        samlABLCRule: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:ABLCRule'),
        samlEnvVarABLCRule: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:ABLCRule'),
      },
      oidcAuth: {
        oidcProviderName: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:providerName'),
        oidcIssuerHost: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:issuerHost'),
        oidcAuthorizationEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:authorizationEndpoint'),
        oidcTokenEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:tokenEndpoint'),
        oidcRevocationEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:revocationEndpoint'),
        oidcIntrospectionEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:introspectionEndpoint'),
        oidcUserInfoEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:userInfoEndpoint'),
        oidcEndSessionEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:endSessionEndpoint'),
        oidcRegistrationEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:registrationEndpoint'),
        oidcJWKSUri: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:jwksUri'),
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
   *    /_api/v3/security-setting/authentication/enabled:
   *      put:
   *        tags: [SecuritySetting, apiv3]
   *        description: Update authentication isEnabled
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  isEnabled:
   *                    type: boolean
   *                  target:
   *                    type: string
   *        responses:
   *          200:
   *            description: Succeeded to enable authentication
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  description: updated param
   */
  router.put('/authentication/enabled', loginRequiredStrictly, adminRequired, csrf, validator.authenticationSetting, apiV3FormValidator, async(req, res) => {
    const { isEnabled, authId } = req.body;

    let setupStrategies = await crowi.passportService.getSetupStrategies();

    // Reflect request param
    setupStrategies = setupStrategies.filter(strategy => strategy !== authId);

    if (setupStrategies.length === 0) {
      return res.apiv3Err(new ErrorV3('Can not turn everything off'), 405);
    }

    const enableParams = { [`security:passport-${authId}:isEnabled`]: isEnabled };

    try {
      await updateAndReloadStrategySettings(authId, enableParams);

      const responseParams = {
        [`security:passport-${authId}:isEnabled`]: await crowi.configManager.getConfig('crowi', `security:passport-${authId}:isEnabled`),
      };

      return res.apiv3({ responseParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating enable setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-enable-setting failed'));
    }


  });

  /**
   * @swagger
   *
   *    /_api/v3/security-setting/authentication:
   *      get:
   *        tags: [SecuritySetting, apiv3]
   *        description: Get setup strategies for passport
   *        responses:
   *          200:
   *            description: params of setup strategies
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    setupStrategies:
   *                      type: array
   *                      description: setup strategies list
   *                      items:
   *                        type: string
   *                        description: setup strategie
   *                      example: ["local"]
   */
  router.get('/authentication/', loginRequiredStrictly, adminRequired, async(req, res) => {
    const setupStrategies = await crowi.passportService.getSetupStrategies();

    return res.apiv3({ setupStrategies });
  });

  /**
   * @swagger
   *
   *    /_api/v3/security-setting/general-setting:
   *      put:
   *        tags: [SecuritySetting, apiv3]
   *        description: Update GeneralSetting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/GeneralSetting'
   *        responses:
   *          200:
   *            description: Succeeded to update general Setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/GeneralSetting'
   */
  router.put('/general-setting', loginRequiredStrictly, adminRequired, validator.generalSetting, apiV3FormValidator, async(req, res) => {
    const updateData = {
      'security:sessionMaxAge': parseInt(req.body.sessionMaxAge),
      'security:restrictGuestMode': req.body.restrictGuestMode,
      'security:pageCompleteDeletionAuthority': req.body.pageCompleteDeletionAuthority,
      'security:list-policy:hideRestrictedByOwner': req.body.hideRestrictedByOwner,
      'security:list-policy:hideRestrictedByGroup': req.body.hideRestrictedByGroup,
    };
    const wikiMode = await crowi.configManager.getConfig('crowi', 'security:wikiMode');
    if (wikiMode === 'private' || wikiMode === 'public') {
      logger.debug('security:restrictGuestMode will not be changed because wiki mode is forced to set');
      delete updateData['security:restrictGuestMode'];
    }
    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', updateData);
      const securitySettingParams = {
        sessionMaxAge: await crowi.configManager.getConfig('crowi', 'security:sessionMaxAge'),
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
   *    /_api/v3/security-setting/all-share-links:
   *      get:
   *        tags: [ShareLinkSettings, apiv3]
   *        description: Get All ShareLinks at Share Link Setting
   *        responses:
   *          200:
   *            description: all share links
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    securityParams:
   *                      type: object
   *                      description: suceed to get all share links
   */
  router.get('/all-share-links/', loginRequiredStrictly, adminRequired, async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const linkQuery = {};
    try {
      const paginateResult = await ShareLink.paginate(
        linkQuery,
        {
          page,
          limit,
          populate: {
            path: 'relatedPage',
            select: 'path',
          },
        },
      );
      return res.apiv3({ paginateResult });
    }
    catch (err) {
      const msg = 'Error occured in get share link';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'get-all-share-links-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /_api/v3/security-setting/all-share-links:
   *      delete:
   *        tags: [ShareLinkSettings, apiv3]
   *        description: Delete All ShareLinks at Share Link Setting
   *        responses:
   *          200:
   *            description: succeed to delete all share links
   */

  router.delete('/all-share-links/', loginRequiredStrictly, adminRequired, async(req, res) => {
    const ShareLink = crowi.model('ShareLink');
    try {
      const removedAct = await ShareLink.remove({});
      const removeTotal = await removedAct.n;
      return res.apiv3({ removeTotal });
    }
    catch (err) {
      const msg = 'Error occured in delete all share links';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'failed-to-delete-all-share-links'));
    }
  });

  /**
   * @swagger
   *
   *    /_api/v3/security-setting/local-setting:
   *      put:
   *        tags: [LocalSetting, apiv3]
   *        description: Update LocalSetting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/LocalSetting'
   *        responses:
   *          200:
   *            description: Succeeded to update local Setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/LocalSetting'
   */
  router.put('/local-setting', loginRequiredStrictly, adminRequired, csrf, validator.localSetting, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:registrationMode': req.body.registrationMode,
      'security:registrationWhiteList': req.body.registrationWhiteList,
    };
    try {
      await updateAndReloadStrategySettings('local', requestParams);

      const localSettingParams = {
        registrationMode: await crowi.configManager.getConfig('crowi', 'security:registrationMode'),
        registrationWhiteList: await crowi.configManager.getConfig('crowi', 'security:registrationWhiteList'),
      };
      return res.apiv3({ localSettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating local setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-local-setting failed'));
    }
  });

  /**
   * @swagger
   *
   *    /_api/v3/security-setting/ldap:
   *      put:
   *        tags: [SecuritySetting, apiv3]
   *        description: Update LDAP setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/LdapAuthSetting'
   *        responses:
   *          200:
   *            description: Succeeded to update LDAP setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/LdapAuthSetting'
   */
  router.put('/ldap', loginRequiredStrictly, adminRequired, csrf, validator.ldapAuth, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-ldap:serverUrl': req.body.serverUrl,
      'security:passport-ldap:isUserBind': req.body.isUserBind,
      'security:passport-ldap:bindDN': req.body.ldapBindDN,
      'security:passport-ldap:bindDNPassword': req.body.ldapBindDNPassword,
      'security:passport-ldap:searchFilter': req.body.ldapSearchFilter,
      'security:passport-ldap:attrMapUsername': req.body.ldapAttrMapUsername,
      'security:passport-ldap:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
      'security:passport-ldap:attrMapMail': req.body.ldapAttrMapMail,
      'security:passport-ldap:attrMapName': req.body.ldapAttrMapName,
      'security:passport-ldap:groupSearchBase': req.body.ldapGroupSearchBase,
      'security:passport-ldap:groupSearchFilter': req.body.ldapGroupSearchFilter,
      'security:passport-ldap:groupDnProperty': req.body.ldapGroupDnProperty,
    };

    try {
      await updateAndReloadStrategySettings('ldap', requestParams);

      const securitySettingParams = {
        serverUrl: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:serverUrl'),
        isUserBind: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:isUserBind'),
        ldapBindDN: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:bindDN'),
        ldapBindDNPassword: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:bindDNPassword'),
        ldapSearchFilter: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:searchFilter'),
        ldapAttrMapUsername: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:attrMapUsername'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:isSameUsernameTreatedAsIdenticalUser'),
        ldapAttrMapMail: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:attrMapMail'),
        ldapAttrMapName: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:attrMapName'),
        ldapGroupSearchBase: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:groupSearchBase'),
        ldapGroupSearchFilter: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:groupSearchFilter'),
        ldapGroupDnProperty: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:groupDnProperty'),
      };
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating SAML setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-SAML-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /_api/v3/security-setting/saml:
   *      put:
   *        tags: [SecuritySetting, apiv3]
   *        description: Update SAML setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SamlAuthSetting'
   *        responses:
   *          200:
   *            description: Succeeded to update SAML setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/SamlAuthSetting'
   */
  router.put('/saml', loginRequiredStrictly, adminRequired, csrf, validator.samlAuth, apiV3FormValidator, async(req, res) => {

    //  For the value of each mandatory items,
    //  check whether it from the environment variables is empty and form value to update it is empty
    //  validate the syntax of a attribute - based login control rule
    const invalidValues = [];
    for (const configKey of crowi.passportService.mandatoryConfigKeysForSaml) {
      const key = configKey.replace('security:passport-saml:', '');
      const formValue = req.body[key];
      if (crowi.configManager.getConfigFromEnvVars('crowi', configKey) === null && formValue == null) {
        const formItemName = req.t(`security_setting.form_item_name.${key}`);
        invalidValues.push(req.t('form_validation.required', formItemName));
      }
    }
    if (invalidValues.length !== 0) {
      return res.apiv3Err(req.t('form_validation.error_message'), 400, invalidValues);
    }

    const rule = req.body.ABLCRule;
    // Empty string disables attribute-based login control.
    // So, when rule is empty string, validation is passed.
    if (rule != null) {
      try {
        crowi.passportService.parseABLCRule(rule);
      }
      catch (err) {
        return res.apiv3Err(req.t('form_validation.invalid_syntax', req.t('security_setting.form_item_name.ABLCRule')), 400);
      }
    }

    const requestParams = {
      'security:passport-saml:entryPoint': req.body.entryPoint,
      'security:passport-saml:issuer': req.body.issuer,
      'security:passport-saml:cert': req.body.cert,
      'security:passport-saml:attrMapId': req.body.attrMapId,
      'security:passport-saml:attrMapUsername': req.body.attrMapUsername,
      'security:passport-saml:attrMapMail': req.body.attrMapMail,
      'security:passport-saml:attrMapFirstName': req.body.attrMapFirstName,
      'security:passport-saml:attrMapLastName': req.body.attrMapLastName,
      'security:passport-saml:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
      'security:passport-saml:isSameEmailTreatedAsIdenticalUser': req.body.isSameEmailTreatedAsIdenticalUser,
      'security:passport-saml:ABLCRule': req.body.ABLCRule,
    };

    try {
      await updateAndReloadStrategySettings('saml', requestParams);

      const securitySettingParams = {
        missingMandatoryConfigKeys: await crowi.passportService.getSamlMissingMandatoryConfigKeys(),
        samlEntryPoint: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:entryPoint'),
        samlIssuer: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:issuer'),
        samlCert: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:cert'),
        samlAttrMapId: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapId'),
        samlAttrMapUsername: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapUsername'),
        samlAttrMapMail: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapMail'),
        samlAttrMapFirstName: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapFirstName'),
        samlAttrMapLastName: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapLastName'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-saml:isSameUsernameTreatedAsIdenticalUser'),
        isSameEmailTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-saml:isSameEmailTreatedAsIdenticalUser'),
        samlABLCRule: await crowi.configManager.getConfig('crowi', 'security:passport-saml:ABLCRule'),
      };
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating SAML setting';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-SAML-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /_api/v3/security-setting/oidc:
   *      put:
   *        tags: [SecuritySetting, apiv3]
   *        description: Update OpenID Connect setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/OidcAuthSetting'
   *        responses:
   *          200:
   *            description: Succeeded to update OpenID Connect setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/OidcAuthSetting'
   */
  router.put('/oidc', loginRequiredStrictly, adminRequired, csrf, validator.oidcAuth, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-oidc:providerName': req.body.oidcProviderName,
      'security:passport-oidc:issuerHost': req.body.oidcIssuerHost,
      'security:passport-oidc:authorizationEndpoint': req.body.oidcAuthorizationEndpoint,
      'security:passport-oidc:tokenEndpoint': req.body.oidcTokenEndpoint,
      'security:passport-oidc:revocationEndpoint': req.body.oidcRevocationEndpoint,
      'security:passport-oidc:introspectionEndpoint': req.body.oidcIntrospectionEndpoint,
      'security:passport-oidc:userInfoEndpoint': req.body.oidcUserInfoEndpoint,
      'security:passport-oidc:endSessionEndpoint': req.body.oidcEndSessionEndpoint,
      'security:passport-oidc:registrationEndpoint': req.body.oidcRegistrationEndpoint,
      'security:passport-oidc:jwksUri': req.body.oidcJWKSUri,
      'security:passport-oidc:clientId': req.body.oidcClientId,
      'security:passport-oidc:clientSecret': req.body.oidcClientSecret,
      'security:passport-oidc:attrMapId': req.body.oidcAttrMapId,
      'security:passport-oidc:attrMapUserName': req.body.oidcAttrMapUserName,
      'security:passport-oidc:attrMapName': req.body.oidcAttrMapName,
      'security:passport-oidc:attrMapMail': req.body.oidcAttrMapEmail,
      'security:passport-oidc:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
      'security:passport-oidc:isSameEmailTreatedAsIdenticalUser': req.body.isSameEmailTreatedAsIdenticalUser,
    };

    try {
      await updateAndReloadStrategySettings('oidc', requestParams);

      const securitySettingParams = {
        oidcProviderName: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:providerName'),
        oidcIssuerHost: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:issuerHost'),
        oidcAuthorizationEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:authorizationEndpoint'),
        oidcTokenEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:tokenEndpoint'),
        oidcRevocationEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:revocationEndpoint'),
        oidcIntrospectionEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:introspectionEndpoint'),
        oidcUserInfoEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:userInfoEndpoint'),
        oidcEndSessionEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:endSessionEndpoint'),
        oidcRegistrationEndpoint: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:registrationEndpoint'),
        oidcJWKSUri: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:jwksUri'),
        oidcClientId: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:clientId'),
        oidcClientSecret: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:clientSecret'),
        oidcAttrMapId: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:attrMapId'),
        oidcAttrMapUserName: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:attrMapUserName'),
        oidcAttrMapName: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:attrMapName'),
        oidcAttrMapEmail: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:attrMapMail'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:isSameUsernameTreatedAsIdenticalUser'),
        isSameEmailTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:isSameEmailTreatedAsIdenticalUser'),
      };
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      const msg = 'Error occurred in updating OpenIDConnect';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-OpenIDConnect-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /_api/v3/security-setting/basic:
   *      put:
   *        tags: [SecuritySetting, apiv3]
   *        description: Update basic
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/BasicAuthSetting'
   *        responses:
   *          200:
   *            description: Succeeded to update basic
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/BasicAuthSetting'
   */
  router.put('/basic', loginRequiredStrictly, adminRequired, csrf, validator.basicAuth, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-basic:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    try {
      await updateAndReloadStrategySettings('basic', requestParams);

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
   *    /_api/v3/security-setting/google-oauth:
   *      put:
   *        tags: [SecuritySetting, apiv3]
   *        description: Update google OAuth
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/GoogleOAuthSetting'
   *        responses:
   *          200:
   *            description: Succeeded to google OAuth
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/GoogleOAuthSetting'
   */
  router.put('/google-oauth', loginRequiredStrictly, adminRequired, csrf, validator.googleOAuth, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-google:clientId': req.body.googleClientId,
      'security:passport-google:clientSecret': req.body.googleClientSecret,
      'security:passport-google:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    try {
      await updateAndReloadStrategySettings('google', requestParams);

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
   *    /_api/v3/security-setting/github-oauth:
   *      put:
   *        tags: [SecuritySetting, apiv3]
   *        description: Update github OAuth
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/GitHubOAuthSetting'
   *        responses:
   *          200:
   *            description: Succeeded to github OAuth
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/GitHubOAuthSetting'
   */
  router.put('/github-oauth', loginRequiredStrictly, adminRequired, csrf, validator.githubOAuth, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-github:clientId': req.body.githubClientId,
      'security:passport-github:clientSecret': req.body.githubClientSecret,
      'security:passport-github:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    try {
      await updateAndReloadStrategySettings('github', requestParams);

      const securitySettingParams = {
        githubClientId: await crowi.configManager.getConfig('crowi', 'security:passport-github:clientId'),
        githubClientSecret: await crowi.configManager.getConfig('crowi', 'security:passport-github:clientSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-github:isSameUsernameTreatedAsIdenticalUser'),
      };
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      // reset strategy
      await crowi.passportService.resetGitHubStrategy();
      const msg = 'Error occurred in updating githubOAuth';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-githubOAuth-failed'));
    }
  });

  /**
   * @swagger
   *
   *    /_api/v3/security-setting/twitter-oauth:
   *      put:
   *        tags: [SecuritySetting, apiv3]
   *        description: Update twitter OAuth
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/TwitterOAuthSetting'
   *        responses:
   *          200:
   *            description: Succeeded to update twitter OAuth
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/TwitterOAuthSetting'
   */
  router.put('/twitter-oauth', loginRequiredStrictly, adminRequired, csrf, validator.twitterOAuth, apiV3FormValidator, async(req, res) => {

    let requestParams = {
      'security:passport-twitter:consumerKey': req.body.twitterConsumerKey,
      'security:passport-twitter:consumerSecret': req.body.twitterConsumerSecret,
      'security:passport-twitter:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    requestParams = removeNullPropertyFromObject(requestParams);

    try {
      await updateAndReloadStrategySettings('twitter', requestParams);

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
