import { ErrorV3 } from '@growi/core';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:healthcheck'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const noCache = require('nocache');

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

  async function checkMongo(errors, info) {
    try {
      const Config = crowi.models.Config;
      await Config.findOne({});

      info.mongo = 'OK';
    }
    catch (err) {
      errors.push(new ErrorV3(`MongoDB is not connectable - ${err.message}`, 'healthcheck-mongodb-unhealthy', err.stack));
    }
  }

  async function checkSearch(errors, info) {
    const { searchService } = crowi;
    if (searchService.isConfigured) {
      try {
        info.searchInfo = await searchService.getInfoForHealth();
        searchService.resetErrorStatus();
      }
      catch (err) {
        errors.push(new ErrorV3(`The Search Service is not connectable - ${err.message}`, 'healthcheck-search-unhealthy', err.stack));
      }
    }
  }

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
   *        - name: checkServices
   *          in: query
   *          description: The list of services to check health
   *          schema:
   *            type: array
   *            items:
   *              type: string
   *              enum:
   *                - mongo
   *                - search
   *        - name: strictly
   *          in: query
   *          description: Check services and responds 503 if either of these is unhealthy
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
  router.get('/', noCache(), async(req, res) => {
    let checkServices = req.query.checkServices || [];
    let isStrictly = req.query.strictly != null;

    // for backward compatibility
    if (req.query.connectToMiddlewares != null) {
      logger.warn('The param \'connectToMiddlewares\' is deprecated. Use \'checkServices[]\' instead.');
      checkServices = ['mongo', 'search'];
    }
    if (req.query.checkMiddlewaresStrictly != null) {
      logger.warn('The param \'checkMiddlewaresStrictly\' is deprecated. Use \'checkServices[]\' and \'strictly\' instead.');
      checkServices = ['mongo', 'search'];
      isStrictly = true;
    }

    // return 200 w/o checking
    if (checkServices.length === 0) {
      res.status(200).send({ status: 'OK' });
      return;
    }

    const errors = [];
    const info = {};

    // connect to MongoDB
    if (checkServices.includes('mongo')) {
      await checkMongo(errors, info);
    }

    // connect to search service
    if (checkServices.includes('search')) {
      await checkSearch(errors, info);
    }

    if (errors.length > 0) {
      let httpStatus = 200;
      if (isStrictly) {
        httpStatus = 503;
      }

      return res.apiv3Err(errors, httpStatus, info);
    }

    res.status(200).send({ info });
  });

  return router;
};
