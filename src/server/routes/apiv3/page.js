const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:page'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Page
 */

module.exports = (crowi) => {
  const { exportService } = crowi;

  /**
   * @swagger
   *
   *  /page/dump:
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
  router.get('/dump', async(req, res) => {
    try {
      await exportService.exportPageCollection();
      return res.status(200).send({ status: 'DONE' });
    }
    catch (err) {
      // TODO:user ApiV3Error
      logger.error(err);
      return res.status(500).send({ status: 'ERROR' });
    }
  });

  return router;
};
