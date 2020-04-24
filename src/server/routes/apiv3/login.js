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
   */
  router.get('/', accessTokenParser, async(req, res) => {
    const data = {};
    try {
      data.isRegistrationEnabled = true;
      data.registrationMode = 'Open';
      data.registrationWhiteList = [];
      data.isLocalStrategySetup = true;
      data.isLdapStrategySetup = true;
      data.objOfIsExternalAuthEnableds = {
        google: true,
        github: true,
        facebook: true,
        twitter: true,
        oidc: true,
        saml: true,
        basic: true,
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
