const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:healthcheck'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const helmet = require('helmet');
const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: Healthcheck
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      HealthcheckInfo:
 *        description: Information of middlewares
 *        type: object
 *        properties:
 *          mongo:
 *            type: string
 *            description: 'OK'
 *            example: 'OK'
 *          searchInfo:
 *            type: object
 *            example: {
 *              "esVersion":"6.6.1",
 *              "esNodeInfos":{
 *                "6pnILIqFT_Cjbs4mwQfcmA": {
 *                  "name":"6pnILIq",
 *                  "version":"6.6.1",
 *                  "plugins":[
 *                    {"name":"analysis-icu","version":"6.6.1"},
 *                    {"name":"analysis-kuromoji","version":"6.6.1"},
 *                    {"name":"ingest-geoip","version":"6.6.1"},
 *                    {"name":"ingest-user-agent","version":"6.6.1"}
 *                  ]
 *                }
 *              }
 *            }
 */

module.exports = (crowi) => {
  /**
   * @swagger
   *
   *  /healthcheck:
   *    get:
   *      tags: [Healthcheck]
   *      operationId: getHealthcheck
   *      summary: /healthcheck
   *      description: Check whether the server is healthy or not
   *      parameters:
   *        - name: connectToMiddlewares
   *          in: query
   *          description: Check MongoDB and SearchService (consider as healthy even if any of middleware is available or not)
   *          schema:
   *            type: boolean
   *        - name: checkMiddlewaresStrictly
   *          in: query
   *          description: Check MongoDB and SearchService and responds 503 if either of these is unhealthy
   *          schema:
   *            type: boolean
   *      responses:
   *        200:
   *          description: Healthy
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  info:
   *                    $ref: '#/components/schemas/HealthcheckInfo'
   *        503:
   *          description: Unhealthy
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  errors:
   *                    type: array
   *                    description: Errors
   *                    items:
   *                      $ref: '#/components/schemas/ErrorV3'
   *                  info:
   *                    $ref: '#/components/schemas/HealthcheckInfo'
   */
  router.get('/', helmet.noCache(), async(req, res) => {
    const connectToMiddlewares = req.query.connectToMiddlewares != null;
    const checkMiddlewaresStrictly = req.query.checkMiddlewaresStrictly != null;

    // return 200 w/o connecting to MongoDB and SearchService
    if (!connectToMiddlewares && !checkMiddlewaresStrictly) {
      res.status(200).send({ status: 'OK' });
      return;
    }

    const errors = [];
    const info = {};

    // connect to MongoDB
    try {
      const Config = crowi.models.Config;
      await Config.findOne({});

      info.mongo = 'OK';
    }
    catch (err) {
      errors.push(new ErrorV3(`MongoDB is not connectable - ${err.message}`, 'healthcheck-mongodb-unhealthy', err.stack));
    }

    // connect to search service
    const { searchService } = crowi;
    if (searchService.isConfigured) {
      try {
        info.searchInfo = await searchService.getInfo();
      }
      catch (err) {
        errors.push(new ErrorV3(`The Search Service is not connectable - ${err.message}`, 'healthcheck-search-unhealthy', err.stack));
      }
    }

    if (errors.length > 0) {
      let httpStatus = 200;
      if (checkMiddlewaresStrictly) {
        httpStatus = 503;
      }

      return res.apiv3Err(errors, httpStatus, info);
    }

    res.status(200).send({ info });
  });

  return router;
};
