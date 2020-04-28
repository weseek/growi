const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:login'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: logins
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middleware/access-token-parser')(crowi);
  const { passportService, configManager } = crowi;
  /**
   * @swagger
   *
   *    /login:
   *      get:
   *        summary: /login
   *        description: Get data for rendering login form
   *        responses:
   *          200:
   *            description: Succeeded to get data for rendering login form.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    data:
   *                      type: object
   *                      description: data for rendering login form
   */
  router.get('/', accessTokenParser, async(req, res) => {
    const data = {};
    try {
      data.isRegistrationEnabled = passportService.isLocalStrategySetup
        && await configManager.getConfig('crowi', 'security:registrationMode') !== 'Closed';
      data.registrationMode = await configManager.getConfig('crowi', 'security:registrationMode');
      data.registrationWhiteList = await configManager.getConfig('crowi', 'security:registrationWhiteList');
      data.isLocalStrategySetup = passportService.isLocalStrategySetup;
      data.isLdapStrategySetup = passportService.isLdapStrategySetup;
      data.objOfIsExternalAuthEnableds = {
        google: configManager.getConfig('crowi', 'security:passport-google:isEnabled'),
        github: configManager.getConfig('crowi', 'security:passport-github:isEnabled'),
        facebook: configManager.getConfig('crowi', 'security:passport-facebook:isEnabled'),
        twitter: configManager.getConfig('crowi', 'security:passport-twitter:isEnabled'),
        oidc: configManager.getConfig('crowi', 'security:passport-oidc:isEnabled'),
        saml: configManager.getConfig('crowi', 'security:passport-saml:isEnabled'),
        basic: configManager.getConfig('crowi', 'security:passport-basic:isEnabled'),
      };
      return res.apiv3({ data });
    }
    catch (err) {
      logger.error('get-auth-setting-data-failed', err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;
};
