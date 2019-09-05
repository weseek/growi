const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:export'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Export
 */

module.exports = (crowi) => {
  const { exportService } = crowi;
  const { Page } = crowi.models;

  /**
   * @swagger
   *
   *  /export/pages:
   *    get:
   *      tags: [Page]
   *      description: generate a zipped json for page collection
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: a zip file is generated
   *          content:
   *            application/json:
   */
  router.get('/pages', async(req, res) => {
    // TODO: rename path to "/:collection" and add express validator
    try {
      await exportService.exportCollection(Page);
      // TODO:use res.apiv3
      return res.status(200).send({ status: 'DONE' });
    }
    catch (err) {
      // TODO: use ApiV3Error
      logger.error(err);
      return res.status(500).send({ status: 'ERROR' });
    }
  });

  return router;
};
