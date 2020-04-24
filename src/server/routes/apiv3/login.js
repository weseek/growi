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
    console.log('aaaa');
    try {
      return res.apiv3({ content: 'aa' });
    }
    catch (err) {
      logger.error('get-auth-setting-data-failed', err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;
};
