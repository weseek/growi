const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:search'); // eslint-disable-line no-unused-vars

const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const helmet = require('helmet');

const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: Search
 */
module.exports = (crowi) => {
  const accessTokenParser = require('../../middleware/access-token-parser')(crowi);
  const loginRequired = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { ApiV3FormValidator } = crowi.middlewares;

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
   *                  info:
   *                    type: object
   */
  router.get('/indices', helmet.noCache(), accessTokenParser, loginRequired, adminRequired, async(req, res) => {
    const { searchService } = crowi;

    if (!searchService.isConfigured) {
      return res.apiv3Err(new ErrorV3('SearchService is not configured', 'search-service-unconfigured'), 503);
    }

    try {
      const info = await searchService.getInfoForAdmin();
      return res.status(200).send({ info });
    }
    catch (err) {
      return res.apiv3Err(err, 503);
    }
  });

  /**
   * @swagger
   *
   *  /search/connection:
   *    get:
   *      tags: [Search]
   *      summary: /search/connection
   *      description: Reconnect to Elasticsearch
   *      responses:
   *        200:
   *          description: Successfully connected
   */
  router.post('/connection', accessTokenParser, loginRequired, adminRequired, async(req, res) => {
    const { searchService } = crowi;

    if (!searchService.isConfigured) {
      return res.apiv3Err(new ErrorV3('SearchService is not configured', 'search-service-unconfigured'));
    }

    try {
      await searchService.initClient();
      return res.status(200).send();
    }
    catch (err) {
      return res.apiv3Err(err, 503);
    }
  });

  const validatorForPutIndices = [
    body('operation').isString().isIn(['rebuild', 'normalize']),
  ];

  /**
   * @swagger
   *
   *  /search/indices:
   *    put:
   *      tags: [Search]
   *      summary: /search/indices
   *      description: Operate indices
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              properties:
   *                operation:
   *                  type: string
   *                  description: Operation type against to indices >
   *                    * `normalize` - Normalize indices
   *                    * `rebuild` - Rebuild indices
   *                  enum: [normalize, rebuild]
   *      responses:
   *        200:
   *          description: Return 200
   */
  router.put('/indices', accessTokenParser, loginRequired, adminRequired, csrf, validatorForPutIndices, ApiV3FormValidator, async(req, res) => {
    const operation = req.body.operation;

    const { searchService } = crowi;

    if (!searchService.isConfigured) {
      return res.apiv3Err(new ErrorV3('SearchService is not configured', 'search-service-unconfigured'));
    }
    if (!searchService.isReachable) {
      return res.apiv3Err(new ErrorV3('SearchService is not reachable', 'search-service-unreachable'));
    }

    try {
      switch (operation) {
        case 'normalize':
          // wait the processing is terminated
          await searchService.normalizeIndices();
          return res.status(200).send({ message: 'Operation is successfully processed.' });
        case 'rebuild':
          // NOT wait the processing is terminated
          searchService.rebuildIndex();
          return res.status(200).send({ message: 'Operation is successfully requested.' });
        default:
          throw new Error(`Unimplemented operation: ${operation}`);
      }
    }
    catch (err) {
      return res.apiv3Err(err, 503);
    }
  });

  return router;
};
