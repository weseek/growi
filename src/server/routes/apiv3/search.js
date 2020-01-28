const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:search'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const helmet = require('helmet');


/**
 * @swagger
 *  tags:
 *    name: Search
 */
module.exports = (crowi) => {
  const accessTokenParser = require('../../middleware/access-token-parser')(crowi);
  const loginRequired = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);

  /**
   * @swagger
   *
   *  /search/indices:
   *    get:
   *      tags: [Search]
   *      summary: /search/indices
   *      description: Get current status of indices
   *      responses:
   *        200:
   *          description: Status of indices
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   */
  router.get('/indices', helmet.noCache(), accessTokenParser, loginRequired, adminRequired, async(req, res) => {
    // connect to search service
    try {
      const search = crowi.getSearcher();
      const info = await search.getInfoForAdmin();
      return res.status(200).send({ info });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  /**
   * @swagger
   *
   *  /search/indices:
   *    put:
   *      tags: [Search]
   *      summary: /search/indices
   *      description: Init indices
   *      responses:
   *        200:
   *          description: Return 200
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   */
  router.put('/indices', accessTokenParser, loginRequired, adminRequired, async(req, res) => {
    res.status(200).send({});
  });

  /**
   * @swagger
   *
   *  /search/indices/rebuild:
   *    post:
   *      tags: [Search]
   *      summary: /search/rebuild
   *      description: Rebuild index
   *      responses:
   *        200:
   *          description: Return 200 when rebuilding is successfully requested
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   */
  router.post('/indices/rebuild', accessTokenParser, loginRequired, adminRequired, async(req, res) => {
    res.status(200).send({});
  });

  return router;
};
