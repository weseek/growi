import { ErrorV3 } from '@growi/core';

import { GrowiExternalAuthProviderType } from '~/features/questionnaire/interfaces/growi-info';
import { SupportedAction } from '~/interfaces/activity';
import { PageDeleteConfigValue } from '~/interfaces/page-delete-config';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';
import { validateDeleteConfigs, prepareDeleteConfigValuesForCalc } from '~/utils/page-delete-config';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';


const logger = loggerFactory('growi:routes:apiv3:security-setting');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator');

const validator = {
  generalSetting: [
    body('sessionMaxAge').optional({ checkFalsy: true }).trim().isInt(),
    body('restrictGuestMode').if(value => value != null).isString().isIn([
      'Deny', 'Readonly',
    ]),
    body('pageCompleteDeletionAuthority').if(value => value != null).isString().isIn(Object.values(PageDeleteConfigValue)),
    body('hideRestrictedByOwner').if(value => value != null).isBoolean(),
    body('hideRestrictedByGroup').if(value => value != null).isBoolean(),
  ],
  shareLinkSetting: [
    body('disableLinkSharing').if(value => value != null).isBoolean(),
  ],
  authenticationSetting: [
    body('isEnabled').if(value => value != null).isBoolean(),
    body('authId').isString().isIn([
      'local', 'ldap', 'saml', 'oidc', 'google', 'github',
    ]),
  ],
  localSetting: [
    body('registrationMode').isString().isIn([
      'Open', 'Restricted', 'Closed',
    ]),
    body('registrationWhitelist').if(value => value != null).isArray().customSanitizer((value, { req }) => {
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
 *      ShareLinkSetting:
 *        type: object
 *        properties:
 *          disableLinkSharing:
 *            type: boolean
 *            description: disable link sharing
 *      LocalSetting:
 *        type: object
 *        properties:
 *          isLocalEnabled:
 *            type: boolean
 *            description: local setting mode
 *          registrationMode:
 *            type: string
 *            description: type of registrationMode
 *          registrationWhitelist:
 *            type: array
 *            description: array of regsitrationList
 *            items:
 *              type: string
 *              description: registration whitelist
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
 */
module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const addActivity = generateAddActivityMiddleware(crowi);

  const activityEvent = crowi.event('activity');

  async function updateAndReloadStrategySettings(authId, params) {
    const { passportService } = crowi;

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
        restrictGuestMode: crowi.aclService.getGuestModeValue(),
        pageDeletionAuthority: await configManager.getConfig('crowi', 'security:pageDeletionAuthority'),
        pageCompleteDeletionAuthority: await configManager.getConfig('crowi', 'security:pageCompleteDeletionAuthority'),
        pageRecursiveDeletionAuthority: await configManager.getConfig('crowi', 'security:pageRecursiveDeletionAuthority'),
        pageRecursiveCompleteDeletionAuthority: await configManager.getConfig('crowi', 'security:pageRecursiveCompleteDeletionAuthority'),
        hideRestrictedByOwner: await configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByOwner'),
        hideRestrictedByGroup: await configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByGroup'),
        wikiMode: await configManager.getConfig('crowi', 'security:wikiMode'),
        sessionMaxAge: await configManager.getConfig('crowi', 'security:sessionMaxAge'),
      },
      shareLinkSetting: {
        disableLinkSharing: await configManager.getConfig('crowi', 'security:disableLinkSharing'),
      },
      localSetting: {
        useOnlyEnvVarsForSomeOptions: await configManager.getConfig('crowi', 'security:passport-local:useOnlyEnvVarsForSomeOptions'),
        registrationMode: await configManager.getConfig('crowi', 'security:registrationMode'),
        registrationWhitelist: await configManager.getConfig('crowi', 'security:registrationWhitelist'),
        isPasswordResetEnabled: await configManager.getConfig('crowi', 'security:passport-local:isPasswordResetEnabled'),
        isEmailAuthenticationEnabled: await configManager.getConfig('crowi', 'security:passport-local:isEmailAuthenticationEnabled'),
      },
      generalAuth: {
        isLocalEnabled: await configManager.getConfig('crowi', 'security:passport-local:isEnabled'),
        isLdapEnabled: await configManager.getConfig('crowi', 'security:passport-ldap:isEnabled'),
        isSamlEnabled: await configManager.getConfig('crowi', 'security:passport-saml:isEnabled'),
        isOidcEnabled: await configManager.getConfig('crowi', 'security:passport-oidc:isEnabled'),
        isGoogleEnabled: await configManager.getConfig('crowi', 'security:passport-google:isEnabled'),
        isGitHubEnabled: await configManager.getConfig('crowi', 'security:passport-github:isEnabled'),
      },
      ldapAuth: {
        serverUrl: await configManager.getConfig('crowi', 'security:passport-ldap:serverUrl'),
        isUserBind: await configManager.getConfig('crowi', 'security:passport-ldap:isUserBind'),
        ldapBindDN: await configManager.getConfig('crowi', 'security:passport-ldap:bindDN'),
        ldapBindDNPassword: await configManager.getConfig('crowi', 'security:passport-ldap:bindDNPassword'),
        ldapSearchFilter: await configManager.getConfig('crowi', 'security:passport-ldap:searchFilter'),
        ldapAttrMapUsername: await configManager.getConfig('crowi', 'security:passport-ldap:attrMapUsername'),
        isSameUsernameTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-ldap:isSameUsernameTreatedAsIdenticalUser'),
        ldapAttrMapMail: await configManager.getConfig('crowi', 'security:passport-ldap:attrMapMail'),
        ldapAttrMapName: await configManager.getConfig('crowi', 'security:passport-ldap:attrMapName'),
        ldapGroupSearchBase: await configManager.getConfig('crowi', 'security:passport-ldap:groupSearchBase'),
        ldapGroupSearchFilter: await configManager.getConfig('crowi', 'security:passport-ldap:groupSearchFilter'),
        ldapGroupDnProperty: await configManager.getConfig('crowi', 'security:passport-ldap:groupDnProperty'),
      },
      samlAuth: {
        missingMandatoryConfigKeys: await crowi.passportService.getSamlMissingMandatoryConfigKeys(),
        useOnlyEnvVarsForSomeOptions: await configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:useOnlyEnvVarsForSomeOptions'),
        samlEntryPoint: await configManager.getConfigFromDB('crowi', 'security:passport-saml:entryPoint'),
        samlEnvVarEntryPoint: await configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:entryPoint'),
        samlIssuer: await configManager.getConfigFromDB('crowi', 'security:passport-saml:issuer'),
        samlEnvVarIssuer: await configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:issuer'),
        samlCert: await configManager.getConfigFromDB('crowi', 'security:passport-saml:cert'),
        samlEnvVarCert: await configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:cert'),
        samlAttrMapId: await configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapId'),
        samlEnvVarAttrMapId: await configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapId'),
        samlAttrMapUsername: await configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapUsername'),
        samlEnvVarAttrMapUsername: await configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapUsername'),
        samlAttrMapMail: await configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapMail'),
        samlEnvVarAttrMapMail: await configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapMail'),
        samlAttrMapFirstName: await configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapFirstName'),
        samlEnvVarAttrMapFirstName: await configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapFirstName'),
        samlAttrMapLastName: await configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapLastName'),
        samlEnvVarAttrMapLastName: await configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:attrMapLastName'),
        isSameUsernameTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-saml:isSameUsernameTreatedAsIdenticalUser'),
        isSameEmailTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-saml:isSameEmailTreatedAsIdenticalUser'),
        samlABLCRule: await configManager.getConfigFromDB('crowi', 'security:passport-saml:ABLCRule'),
        samlEnvVarABLCRule: await configManager.getConfigFromEnvVars('crowi', 'security:passport-saml:ABLCRule'),
      },
      oidcAuth: {
        oidcProviderName: await configManager.getConfig('crowi', 'security:passport-oidc:providerName'),
        oidcIssuerHost: await configManager.getConfig('crowi', 'security:passport-oidc:issuerHost'),
        oidcAuthorizationEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:authorizationEndpoint'),
        oidcTokenEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:tokenEndpoint'),
        oidcRevocationEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:revocationEndpoint'),
        oidcIntrospectionEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:introspectionEndpoint'),
        oidcUserInfoEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:userInfoEndpoint'),
        oidcEndSessionEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:endSessionEndpoint'),
        oidcRegistrationEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:registrationEndpoint'),
        oidcJWKSUri: await configManager.getConfig('crowi', 'security:passport-oidc:jwksUri'),
        oidcClientId: await configManager.getConfig('crowi', 'security:passport-oidc:clientId'),
        oidcClientSecret: await configManager.getConfig('crowi', 'security:passport-oidc:clientSecret'),
        oidcAttrMapId: await configManager.getConfig('crowi', 'security:passport-oidc:attrMapId'),
        oidcAttrMapUserName: await configManager.getConfig('crowi', 'security:passport-oidc:attrMapUserName'),
        oidcAttrMapName: await configManager.getConfig('crowi', 'security:passport-oidc:attrMapName'),
        oidcAttrMapEmail: await configManager.getConfig('crowi', 'security:passport-oidc:attrMapMail'),
        isSameUsernameTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-oidc:isSameUsernameTreatedAsIdenticalUser'),
        isSameEmailTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-oidc:isSameEmailTreatedAsIdenticalUser'),
      },
      googleOAuth: {
        googleClientId: await configManager.getConfig('crowi', 'security:passport-google:clientId'),
        googleClientSecret: await configManager.getConfig('crowi', 'security:passport-google:clientSecret'),
        isSameEmailTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-google:isSameEmailTreatedAsIdenticalUser'),
      },
      githubOAuth: {
        githubClientId: await configManager.getConfig('crowi', 'security:passport-github:clientId'),
        githubClientSecret: await configManager.getConfig('crowi', 'security:passport-github:clientSecret'),
        isSameUsernameTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-github:isSameUsernameTreatedAsIdenticalUser'),
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
  // eslint-disable-next-line max-len
  router.put('/authentication/enabled', loginRequiredStrictly, adminRequired, addActivity, validator.authenticationSetting, apiV3FormValidator, async(req, res) => {
    const { isEnabled, authId } = req.body;
    const ExternalAccount = crowi.model('ExternalAccount');
    const User = crowi.model('User');

    let setupStrategies = await crowi.passportService.getSetupStrategies();

    const parameters = {};

    // Reflect request param
    setupStrategies = setupStrategies.filter(strategy => strategy !== authId);

    if (setupStrategies.length === 0) {
      return res.apiv3Err(new ErrorV3('Can not turn everything off'), 405);
    }

    const allActiveAuthMethodsWithAdmin = await getAllActiveAuthMethodsWithAdmin();

    // Return an error when disabling an authentication method when there are no active authentication methods with admin-enabled login
    if (!isEnabled && allActiveAuthMethodsWithAdmin.length === 0) {
      return res.apiv3Err(new ErrorV3('Must have admin enabled authentication method'), 405);
    }

    // Get all authentication methods that have admin users
    async function getAllActiveAuthMethodsWithAdmin() {
      const activeAuthMethodsWithAdmin = [];

      // Check the local auth method
      await checkAndAddActiveAuthMethodWithAdmin('local', activeAuthMethodsWithAdmin);

      // Check external auth methods
      const externalAuthTypes = Object.values(GrowiExternalAuthProviderType);
      await Promise.all(externalAuthTypes.map(async(strategy) => {
        await checkAndAddActiveAuthMethodWithAdmin(strategy, activeAuthMethodsWithAdmin);
      }));

      return activeAuthMethodsWithAdmin;
    }

    // Check and add an authentication method with admin to the list
    async function checkAndAddActiveAuthMethodWithAdmin(strategy, activeAuthMethodsWithAdmin) {
      const configKey = `security:passport-${strategy}:isEnabled`;
      const isEnabled = configManager.getConfig('crowi', configKey);
      const hasAdmin = await checkAuthStrategyHasAdmin(strategy);
      if (isEnabled && hasAdmin && setupStrategies.includes(strategy)) {
        activeAuthMethodsWithAdmin.push(strategy);
      }
    }

    // Check auth strategy has admin user
    async function checkAuthStrategyHasAdmin(strategy) {
      // Check if local accounts have admins
      if (strategy === 'local') {
        // Get all local admin accounts and filter local admins that are not in external accounts
        const localAdmins = await User.aggregate([
          { $match: { admin: true, status: User.STATUS_ACTIVE } },
          {
            $lookup: {
              from: 'externalaccounts',
              localField: '_id',
              foreignField: 'user',
              as: 'externalAccounts',
            },
          },
          { $match: { externalAccounts: [] } },
        ]).exec();
        return localAdmins.length > 0;
      }

      // Check if external accounts have admins
      const externalAccounts = await ExternalAccount.find({ providerType: strategy }).populate('user').exec();
      const hasAdmin = externalAccounts.some(account => account.user?.admin && account.user?.status === User.STATUS_ACTIVE);

      return hasAdmin;
    }


    const enableParams = { [`security:passport-${authId}:isEnabled`]: isEnabled };

    try {
      await updateAndReloadStrategySettings(authId, enableParams);

      const responseParams = {
        [`security:passport-${authId}:isEnabled`]: await configManager.getConfig('crowi', `security:passport-${authId}:isEnabled`),
      };
      switch (authId) {
        case 'local':
          if (isEnabled) {
            parameters.action = SupportedAction.ACTION_ADMIN_AUTH_ID_PASS_ENABLED;
            break;
          }
          parameters.action = SupportedAction.ACTION_ADMIN_AUTH_ID_PASS_DISABLED;
          break;
        case 'ldap':
          if (isEnabled) {
            parameters.action = SupportedAction.ACTION_ADMIN_AUTH_LDAP_ENABLED;
            break;
          }
          parameters.action = SupportedAction.ACTION_ADMIN_AUTH_LDAP_DISABLED;
          break;
        case 'saml':
          if (isEnabled) {
            parameters.action = SupportedAction.ACTION_ADMIN_AUTH_SAML_ENABLED;
            break;
          }
          parameters.action = SupportedAction.ACTION_ADMIN_AUTH_SAML_DISABLED;
          break;
        case 'oidc':
          if (isEnabled) {
            parameters.action = SupportedAction.ACTION_ADMIN_AUTH_OIDC_ENABLED;
            break;
          }
          parameters.action = SupportedAction.ACTION_ADMIN_AUTH_OIDC_DISABLED;
          break;
        case 'google':
          if (isEnabled) {
            parameters.action = SupportedAction.ACTION_ADMIN_AUTH_GOOGLE_ENABLED;
            break;
          }
          parameters.action = SupportedAction.ACTION_ADMIN_AUTH_GOOGLE_DISABLED;
          break;
        case 'github':
          if (isEnabled) {
            parameters.action = SupportedAction.ACTION_ADMIN_AUTH_GITHUB_ENABLED;
            break;
          }
          parameters.action = SupportedAction.ACTION_ADMIN_AUTH_GITHUB_DISABLED;
          break;
      }
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
  router.put('/general-setting', loginRequiredStrictly, adminRequired, addActivity, validator.generalSetting, apiV3FormValidator, async(req, res) => {
    const updateData = {
      'security:sessionMaxAge': parseInt(req.body.sessionMaxAge),
      'security:restrictGuestMode': req.body.restrictGuestMode,
      'security:pageDeletionAuthority': req.body.pageDeletionAuthority,
      'security:pageRecursiveDeletionAuthority': req.body.pageRecursiveDeletionAuthority,
      'security:pageCompleteDeletionAuthority': req.body.pageCompleteDeletionAuthority,
      'security:pageRecursiveCompleteDeletionAuthority': req.body.pageRecursiveCompleteDeletionAuthority,
      'security:list-policy:hideRestrictedByOwner': req.body.hideRestrictedByOwner,
      'security:list-policy:hideRestrictedByGroup': req.body.hideRestrictedByGroup,
    };

    // Validate delete config
    const [singleAuthority1, recursiveAuthority1] = prepareDeleteConfigValuesForCalc(req.body.pageDeletionAuthority, req.body.pageRecursiveDeletionAuthority);
    // eslint-disable-next-line max-len
    const [singleAuthority2, recursiveAuthority2] = prepareDeleteConfigValuesForCalc(req.body.pageCompleteDeletionAuthority, req.body.pageRecursiveCompleteDeletionAuthority);
    const isDeleteConfigNormalized = validateDeleteConfigs(singleAuthority1, recursiveAuthority1)
      && validateDeleteConfigs(singleAuthority2, recursiveAuthority2);
    if (!isDeleteConfigNormalized) {
      return res.apiv3Err(new ErrorV3('Delete config values are not correct.', 'delete_config_not_normalized'));
    }

    const wikiMode = await configManager.getConfig('crowi', 'security:wikiMode');
    if (wikiMode === 'private' || wikiMode === 'public') {
      logger.debug('security:restrictGuestMode will not be changed because wiki mode is forced to set');
      delete updateData['security:restrictGuestMode'];
    }
    try {
      await configManager.updateConfigsInTheSameNamespace('crowi', updateData);
      const securitySettingParams = {
        sessionMaxAge: await configManager.getConfig('crowi', 'security:sessionMaxAge'),
        restrictGuestMode: await configManager.getConfig('crowi', 'security:restrictGuestMode'),
        pageDeletionAuthority: await configManager.getConfig('crowi', 'security:pageDeletionAuthority'),
        pageCompleteDeletionAuthority: await configManager.getConfig('crowi', 'security:pageCompleteDeletionAuthority'),
        pageRecursiveDeletionAuthority: await configManager.getConfig('crowi', 'security:pageRecursiveDeletionAuthority'),
        pageRecursiveCompleteDeletionAuthority: await configManager.getConfig('crowi', 'security:pageRecursiveCompleteDeletionAuthority'),
        hideRestrictedByOwner: await configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByOwner'),
        hideRestrictedByGroup: await configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByGroup'),
      };

      const parameters = { action: SupportedAction.ACTION_ADMIN_SECURITY_SETTINGS_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);

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
   *    /_api/v3/security-setting/share-link-setting:
   *      put:
   *        tags: [SecuritySetting, apiv3]
   *        description: Update ShareLink Setting
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/ShareLinkSetting'
   *        responses:
   *          200:
   *            description: Succeeded to update ShareLink Setting
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/ShareLinkSetting'
   */
  router.put('/share-link-setting', loginRequiredStrictly, adminRequired, addActivity, validator.generalSetting, apiV3FormValidator, async(req, res) => {
    const updateData = {
      'security:disableLinkSharing': req.body.disableLinkSharing,
    };
    try {
      await configManager.updateConfigsInTheSameNamespace('crowi', updateData);
      const securitySettingParams = {
        disableLinkSharing: configManager.getConfig('crowi', 'security:disableLinkSharing'),
      };
      // eslint-disable-next-line max-len
      const parameters = { action: updateData['security:disableLinkSharing'] ? SupportedAction.ACTION_ADMIN_REJECT_SHARE_LINK : SupportedAction.ACTION_ADMIN_PERMIT_SHARE_LINK };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
    const ShareLink = crowi.model('ShareLink');
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
  router.put('/local-setting', loginRequiredStrictly, adminRequired, addActivity, validator.localSetting, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:registrationMode': req.body.registrationMode,
      'security:registrationWhitelist': req.body.registrationWhitelist,
      'security:passport-local:isPasswordResetEnabled': req.body.isPasswordResetEnabled,
      'security:passport-local:isEmailAuthenticationEnabled': req.body.isEmailAuthenticationEnabled,
    };
    try {
      await updateAndReloadStrategySettings('local', requestParams);

      const localSettingParams = {
        registrationMode: await configManager.getConfig('crowi', 'security:registrationMode'),
        registrationWhitelist: await configManager.getConfig('crowi', 'security:registrationWhitelist'),
        isPasswordResetEnabled: await configManager.getConfig('crowi', 'security:passport-local:isPasswordResetEnabled'),
        isEmailAuthenticationEnabled: await configManager.getConfig('crowi', 'security:passport-local:isEmailAuthenticationEnabled'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_AUTH_ID_PASS_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
  router.put('/ldap', loginRequiredStrictly, adminRequired, addActivity, validator.ldapAuth, apiV3FormValidator, async(req, res) => {
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
        serverUrl: await configManager.getConfig('crowi', 'security:passport-ldap:serverUrl'),
        isUserBind: await configManager.getConfig('crowi', 'security:passport-ldap:isUserBind'),
        ldapBindDN: await configManager.getConfig('crowi', 'security:passport-ldap:bindDN'),
        ldapBindDNPassword: await configManager.getConfig('crowi', 'security:passport-ldap:bindDNPassword'),
        ldapSearchFilter: await configManager.getConfig('crowi', 'security:passport-ldap:searchFilter'),
        ldapAttrMapUsername: await configManager.getConfig('crowi', 'security:passport-ldap:attrMapUsername'),
        isSameUsernameTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-ldap:isSameUsernameTreatedAsIdenticalUser'),
        ldapAttrMapMail: await configManager.getConfig('crowi', 'security:passport-ldap:attrMapMail'),
        ldapAttrMapName: await configManager.getConfig('crowi', 'security:passport-ldap:attrMapName'),
        ldapGroupSearchBase: await configManager.getConfig('crowi', 'security:passport-ldap:groupSearchBase'),
        ldapGroupSearchFilter: await configManager.getConfig('crowi', 'security:passport-ldap:groupSearchFilter'),
        ldapGroupDnProperty: await configManager.getConfig('crowi', 'security:passport-ldap:groupDnProperty'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_AUTH_LDAP_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
  router.put('/saml', loginRequiredStrictly, adminRequired, addActivity, validator.samlAuth, apiV3FormValidator, async(req, res) => {

    //  For the value of each mandatory items,
    //  check whether it from the environment variables is empty and form value to update it is empty
    //  validate the syntax of a attribute - based login control rule
    const invalidValues = [];
    for (const configKey of crowi.passportService.mandatoryConfigKeysForSaml) {
      const key = configKey.replace('security:passport-saml:', '');
      const formValue = req.body[key];
      if (configManager.getConfigFromEnvVars('crowi', configKey) === null && formValue == null) {
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
        return res.apiv3Err(req.t('form_validation.invalid_syntax', req.t('security_settings.form_item_name.ABLCRule')), 400);
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
        samlEntryPoint: await configManager.getConfigFromDB('crowi', 'security:passport-saml:entryPoint'),
        samlIssuer: await configManager.getConfigFromDB('crowi', 'security:passport-saml:issuer'),
        samlCert: await configManager.getConfigFromDB('crowi', 'security:passport-saml:cert'),
        samlAttrMapId: await configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapId'),
        samlAttrMapUsername: await configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapUsername'),
        samlAttrMapMail: await configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapMail'),
        samlAttrMapFirstName: await configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapFirstName'),
        samlAttrMapLastName: await configManager.getConfigFromDB('crowi', 'security:passport-saml:attrMapLastName'),
        isSameUsernameTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-saml:isSameUsernameTreatedAsIdenticalUser'),
        isSameEmailTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-saml:isSameEmailTreatedAsIdenticalUser'),
        samlABLCRule: await configManager.getConfig('crowi', 'security:passport-saml:ABLCRule'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_AUTH_SAML_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
  router.put('/oidc', loginRequiredStrictly, adminRequired, addActivity, validator.oidcAuth, apiV3FormValidator, async(req, res) => {
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
        oidcProviderName: await configManager.getConfig('crowi', 'security:passport-oidc:providerName'),
        oidcIssuerHost: await configManager.getConfig('crowi', 'security:passport-oidc:issuerHost'),
        oidcAuthorizationEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:authorizationEndpoint'),
        oidcTokenEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:tokenEndpoint'),
        oidcRevocationEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:revocationEndpoint'),
        oidcIntrospectionEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:introspectionEndpoint'),
        oidcUserInfoEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:userInfoEndpoint'),
        oidcEndSessionEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:endSessionEndpoint'),
        oidcRegistrationEndpoint: await configManager.getConfig('crowi', 'security:passport-oidc:registrationEndpoint'),
        oidcJWKSUri: await configManager.getConfig('crowi', 'security:passport-oidc:jwksUri'),
        oidcClientId: await configManager.getConfig('crowi', 'security:passport-oidc:clientId'),
        oidcClientSecret: await configManager.getConfig('crowi', 'security:passport-oidc:clientSecret'),
        oidcAttrMapId: await configManager.getConfig('crowi', 'security:passport-oidc:attrMapId'),
        oidcAttrMapUserName: await configManager.getConfig('crowi', 'security:passport-oidc:attrMapUserName'),
        oidcAttrMapName: await configManager.getConfig('crowi', 'security:passport-oidc:attrMapName'),
        oidcAttrMapEmail: await configManager.getConfig('crowi', 'security:passport-oidc:attrMapMail'),
        isSameUsernameTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-oidc:isSameUsernameTreatedAsIdenticalUser'),
        isSameEmailTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-oidc:isSameEmailTreatedAsIdenticalUser'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_AUTH_OIDC_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
  router.put('/google-oauth', loginRequiredStrictly, adminRequired, addActivity, validator.googleOAuth, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-google:clientId': req.body.googleClientId,
      'security:passport-google:clientSecret': req.body.googleClientSecret,
      'security:passport-google:isSameEmailTreatedAsIdenticalUser': req.body.isSameEmailTreatedAsIdenticalUser,
    };


    try {
      await updateAndReloadStrategySettings('google', requestParams);

      const securitySettingParams = {
        googleClientId: await configManager.getConfig('crowi', 'security:passport-google:clientId'),
        googleClientSecret: await configManager.getConfig('crowi', 'security:passport-google:clientSecret'),
        isSameEmailTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-google:isSameEmailTreatedAsIdenticalUser'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_AUTH_GOOGLE_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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
  router.put('/github-oauth', loginRequiredStrictly, adminRequired, addActivity, validator.githubOAuth, apiV3FormValidator, async(req, res) => {
    const requestParams = {
      'security:passport-github:clientId': req.body.githubClientId,
      'security:passport-github:clientSecret': req.body.githubClientSecret,
      'security:passport-github:isSameUsernameTreatedAsIdenticalUser': req.body.isSameUsernameTreatedAsIdenticalUser,
    };

    try {
      await updateAndReloadStrategySettings('github', requestParams);

      const securitySettingParams = {
        githubClientId: await configManager.getConfig('crowi', 'security:passport-github:clientId'),
        githubClientSecret: await configManager.getConfig('crowi', 'security:passport-github:clientSecret'),
        isSameUsernameTreatedAsIdenticalUser: await configManager.getConfig('crowi', 'security:passport-github:isSameUsernameTreatedAsIdenticalUser'),
      };
      const parameters = { action: SupportedAction.ACTION_ADMIN_AUTH_GITHUB_UPDATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);
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

  return router;
};
