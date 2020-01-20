
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
  authenticationSetting: [
    body('isEnabled').isBoolean(),
    body('auth').isString().isIn([
      'Local', 'Ldap', 'Saml', 'Oidc', 'Basic', 'Google', 'GitHub', 'Twitter',
    ]),
  ],
  localSetting: [
    body('isLocalEnabled').isBoolean(),
    body('registrationMode').isString(),
    body('registrationWhiteList').isArray(),
  ],
  ldapAuth: [
    body('serverUrl').isString(),
    body('isUserBind').isBoolean(),
    body('ldapBindDN').isString(),
    body('ldapBindDNPassword').isString(),
    body('ldapSearchFilter').isString(),
    body('ldapAttrMapUsername').isString(),
    body('isSameUsernameTreatedAsIdenticalUser').isBoolean(),
    body('ldapAttrMapMail').isString(),
    body('ldapAttrMapName').isString(),
    body('ldapGroupSearchBase').isString(),
    body('ldapGroupSearchFilter').isString(),
    body('ldapGroupDnProperty').isString(),
  ],
  samlAuth: [
    body('samlEntryPoint').isString(),
    body('samlIssuer').isString(),
    body('samlCert').isString(),
    body('samlAttrMapId').isString(),
    body('samlAttrMapUserName').isString(),
    body('samlAttrMapMail').isString(),
    body('samlAttrMapFirstName').isString(),
    body('samlAttrMapLastName').isString(),
    body('isSameUsernameTreatedAsIdenticalUser').isBoolean(),
    body('isSameEmailTreatedAsIdenticalUser').isBoolean(),
  ],
  oidcAuth: [
    body('oidcProviderName').isString(),
    body('oidcIssuerHost').isString(),
    body('oidcClientId').isString(),
    body('oidcClientSecret').isString(),
    body('oidcAttrMapId').isString(),
    body('oidcAttrMapUserName').isString(),
    body('oidcAttrMapEmail').isString(),
    body('isSameUsernameTreatedAsIdenticalUser').isBoolean(),
    body('isSameEmailTreatedAsIdenticalUser').isBoolean(),
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
 *      OidcAuthSetting:
 *        type: object
 *        properties:
 *          oidcProviderName:
 *            type: string
 *            description: provider name for oidc
 *          oidcIssuerHost:
 *            type: string
 *            description: issuer host for oidc
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
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { ApiV3FormValidator } = crowi.middlewares;

  /**
   * @swagger
   *
   *    /_api/v3/security-setting/:
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
      },
      localSetting: {
        isLocalEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-local:isEnabled'),
        registrationMode: await crowi.configManager.getConfig('crowi', 'security:registrationMode'),
        registrationWhiteList: await crowi.configManager.getConfig('crowi', 'security:registrationWhiteList'),
      },
      generalAuth: {
        isLdapEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-ldap:isEnabled'),
        isSamlEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-saml:isEnabled'),
        isOidcEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-oidc:isEnabled'),
        isBasicEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-basic:isEnabled'),
        isGoogleOAuthEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-google:isEnabled'),
        isGithubOAuthEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-github:isEnabled'),
        isTwitterOAuthEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:isEnabled'),
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
        samlEntryPoint: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:entryPoint'),
        samlEnvVarEntryPoint: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:entryPoint'),
        samlIssuer: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:issuer'),
        samlEnvVarIssuer: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:issuer'),
        samlCert: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:cert'),
        samlEnvVarCert: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:cert'),
        samlAttrMapId: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapId'),
        samlEnvVarAttrMapId: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapId'),
        samlAttrMapUserName: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapUsername'),
        samlEnvVarAttrMapUserName: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapUsername'),
        samlAttrMapMail: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapMail'),
        samlEnvVarAttrMapMail: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapMail'),
        samlAttrMapFirstName: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapFirstName'),
        samlEnvVarAttrMapFirstName: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapFirstName'),
        samlAttrMapLastName: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapLastName'),
        samlEnvVarAttrMapLastName: await crowi.configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapLastName'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-saml:isSameUsernameTreatedAsIdenticalUser'),
        isSameEmailTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-saml:isSameEmailTreatedAsIdenticalUser'),
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
        isGoogleStrategySetup: await crowi.passportService.isGoogleStrategySetup,
        googleClientId: await crowi.configManager.getConfig('crowi', 'security:passport-google:clientId'),
        googleClientSecret: await crowi.configManager.getConfig('crowi', 'security:passport-google:clientSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-google:isSameUsernameTreatedAsIdenticalUser'),
      },
      githubOAuth: {
        isGitHubStrategySetup: await crowi.passportService.isGitHubStrategySetup,
        githubClientId: await crowi.configManager.getConfig('crowi', 'security:passport-github:clientId'),
        githubClientSecret: await crowi.configManager.getConfig('crowi', 'security:passport-github:clientSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-github:isSameUsernameTreatedAsIdenticalUser'),
      },
      twitterOAuth: {
        isTwitterStrategySetup: await crowi.passportService.isTwitterStrategySetup,
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
   *        tags: [SecuritySetting]
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
  router.put('/authentication/enabled', loginRequiredStrictly, adminRequired, csrf, validator.authenticationSetting, ApiV3FormValidator, async(req, res) => {
    const { isEnabled, auth } = req.body;
    const authLowerCase = auth.toLowerCase();

    let setupStrategies = await crowi.passportService.getSetupStrategies();

    // Reflect request param
    setupStrategies = setupStrategies.filter(strategy => strategy !== `passport-${authLowerCase}`);

    if (setupStrategies.length === 0) {
      return res.apiv3Err(new ErrorV3('Can not turn everything off'));
    }

    const enableParams = { [`security:passport-${authLowerCase}:isEnabled`]: isEnabled };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', enableParams);

      await crowi.passportService.setupStrategyByAuth(auth);

      const responseParams = { [`security:passport-${authLowerCase}:isEnabled`]: await crowi.configManager.getConfig('crowi', `security:passport-${authLowerCase}:isEnabled`) };

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
   *    /_api/v3/security-setting/general-setting:
   *      put:
   *        tags: [SecuritySetting]
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
  router.put('/general-setting', loginRequiredStrictly, adminRequired, csrf, validator.generalSetting, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:restrictGuestMode': req.body.restrictGuestMode,
      'security:pageCompleteDeletionAuthority': req.body.pageCompleteDeletionAuthority,
      'security:list-policy:hideRestrictedByOwner': req.body.hideRestrictedByOwner,
      'security:list-policy:hideRestrictedByGroup': req.body.hideRestrictedByGroup,
    };
    const wikiMode = await crowi.configManager.getConfig('crowi', 'security:wikiMode');
    if (wikiMode === 'private') {
      logger.debug('security:restrictGuestMode will not be changed because wiki mode is forced to set');
      delete requestParams['security:restrictGuestMode'];
    }
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
   *    /_api/v3/security-setting/local-setting:
   *      put:
   *        tags: [LocalSetting]
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
  router.put('/local-setting', loginRequiredStrictly, adminRequired, csrf, validator.localSetting, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-local:isEnabled': req.body.isLocalEnabled,
      'security:registrationMode': req.body.registrationMode,
      'security:registrationWhiteList': req.body.registrationWhiteList,
    };
    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const localSettingParams = {
        isLocalEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-local:isEnabled'),
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
   *        tags: [SecuritySetting]
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
  router.put('/ldap', loginRequiredStrictly, adminRequired, csrf, validator.ldapAuth, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-ldap:serverUrl': req.body.serverUrl,
      'security:passport-ldap:isUserBind': req.body.isUserBind,
      'security:passport-ldap:bindDN': req.body.ldapBindDN,
      'security:passport-ldap:bindDNPassword': req.body.ldapBindDNPassword,
      'security:passport-ldap:searchFilter': req.body.ldapSearchFilter,
      'security:passport-ldap:attrMapUsername': req.body.ldapAttrMapUserName,
      'security:passport-ldap:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
      'security:passport-ldap:attrMapMail': req.body.ldapAttrMapMail,
      'security:passport-ldap:attrMapName': req.body.ldapAttrMapName,
      'security:passport-ldap:groupSearchBase': req.body.ldapGroupSearchBase,
      'security:passport-ldap:groupSearchFilter': req.body.ldapGroupSearchFilter,
      'security:passport-ldap:groupDnProperty': req.body.ldapGroupDnProperty,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
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
   *        tags: [SecuritySetting]
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
  router.put('/saml', loginRequiredStrictly, adminRequired, csrf, validator.samlAuth, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-saml:entryPoint': req.body.samlEntryPoint,
      'security:passport-saml:issuer': req.body.samlIssuer,
      'security:passport-saml:cert': req.body.samlCert,
      'security:passport-saml:attrMapId': req.body.samlAttrMapId,
      'security:passport-saml:attrMapUsername': req.body.samlAttrMapUserName,
      'security:passport-saml:attrMapMail': req.body.samlAttrMapMail,
      'security:passport-saml:attrMapFirstName': req.body.samlAttrMapFirstName,
      'security:passport-saml:attrMapLastName': req.body.samlAttrMapLastName,
      'security:passport-saml:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
      'security:passport-saml:isSameEmailTreatedAsIdenticalUser': req.body.isSameEmailTreatedAsIdenticalUser,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const securitySettingParams = {
        missingMandatoryConfigKeys: await crowi.passportService.getSamlMissingMandatoryConfigKeys(),
        samlEntryPoint: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:entryPoint'),
        samlIssuer: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:issuer'),
        samlCert: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:cert'),
        samlAttrMapId: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapId'),
        samlAttrMapUserName: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapUsername'),
        samlAttrMapMail: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapMail'),
        samlAttrMapFirstName: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapFirstName'),
        samlAttrMapLastName: await crowi.configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapLastName'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-saml:isSameUsernameTreatedAsIdenticalUser'),
        isSameEmailTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-saml:isSameEmailTreatedAsIdenticalUser'),
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
   *        tags: [SecuritySetting]
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
  router.put('/oidc', loginRequiredStrictly, adminRequired, csrf, validator.oidcAuth, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-oidc:providerName': req.body.oidcProviderName,
      'security:passport-oidc:issuerHost': req.body.oidcIssuerHost,
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
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const securitySettingParams = {
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
   *        tags: [SecuritySetting]
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
   *    /_api/v3/security-setting/google-oauth:
   *      put:
   *        tags: [SecuritySetting]
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
  router.put('/google-oauth', loginRequiredStrictly, adminRequired, csrf, validator.googleOAuth, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-google:clientId': req.body.googleClientId,
      'security:passport-google:clientSecret': req.body.googleClientSecret,
      'security:passport-google:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const securitySettingParams = {
        isGoogleOAuthEnabled: await crowi.configManager.getConfig('crowi', 'security:passport-google:isEnabled'),
        googleClientId: await crowi.configManager.getConfig('crowi', 'security:passport-google:clientId'),
        googleClientSecret: await crowi.configManager.getConfig('crowi', 'security:passport-google:clientSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-google:isSameUsernameTreatedAsIdenticalUser'),
      };
      // reset strategy
      await crowi.passportService.resetGoogleStrategy();
      // setup strategy
      if (crowi.configManager.getConfig('crowi', 'security:passport-google:isEnabled')) {
        await crowi.passportService.setupGoogleStrategy(true);
      }
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      // reset strategy
      await crowi.passportService.resetGoogleStrategy();
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
   *        tags: [SecuritySetting]
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
  router.put('/github-oauth', loginRequiredStrictly, adminRequired, csrf, validator.githubOAuth, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-github:clientId': req.body.githubClientId,
      'security:passport-github:clientSecret': req.body.githubClientSecret,
      'security:passport-github:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const securitySettingParams = {
        isGitHubStrategySetup: await crowi.passportService.isGitHubStrategySetup,
        githubClientId: await crowi.configManager.getConfig('crowi', 'security:passport-github:clientId'),
        githubClientSecret: await crowi.configManager.getConfig('crowi', 'security:passport-github:clientSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-github:isSameUsernameTreatedAsIdenticalUser'),
      };
      // reset strategy
      await crowi.passportService.resetGitHubStrategy();
      // setup strategy
      if (crowi.configManager.getConfig('crowi', 'security:passport-github:isEnabled')) {
        await crowi.passportService.setupGitHubStrategy(true);
      }
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
   *        tags: [SecuritySetting]
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
  router.put('/twitter-oauth', loginRequiredStrictly, adminRequired, csrf, validator.twitterOAuth, ApiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-twitter:consumerKey': req.body.twitterConsumerKey,
      'security:passport-twitter:consumerSecret': req.body.twitterConsumerSecret,
      'security:passport-twitter:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', requestParams);
      const securitySettingParams = {
        isTwitterStrategySetup: await crowi.passportService.isTwitterStrategySetup,
        twitterConsumerId: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:consumerKey'),
        twitterConsumerSecret: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:consumerSecret'),
        isSameUsernameTreatedAsIdenticalUser: await crowi.configManager.getConfig('crowi', 'security:passport-twitter:isSameUsernameTreatedAsIdenticalUser'),
      };
      // reset strategy
      await crowi.passportService.resetTwitterStrategy();
      // setup strategy
      if (crowi.configManager.getConfig('crowi', 'security:passport-twitter:isEnabled')) {
        await crowi.passportService.setupTwitterStrategy(true);
      }
      return res.apiv3({ securitySettingParams });
    }
    catch (err) {
      // reset strategy
      await crowi.passportService.resetTwitterStrategy();
      const msg = 'Error occurred in updating twitterOAuth';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-twitterOAuth-failed'));
    }
  });

  return router;
};
