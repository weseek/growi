const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:export'); // eslint-disable-line no-unused-vars
const path = require('path');

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
   *  /export:
   *    get:
   *      tags: [Export]
   *      description: get mongodb collections names and zip files for them
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: export cache info
   *          content:
   *            application/json:
   */
  router.get('/', async(req, res) => {
    const files = exportService.getStatus();

    // TODO: use res.apiv3
    return res.json({ ok: true, files });
  });

  /**
   * @swagger
   *
   *  /export/pages:
   *    get:
   *      tags: [Export]
   *      description: download a zipped json for page collection
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: a zip file
   *          content:
   *            application/zip:
   */
  router.get('/pages', async(req, res) => {
    // TODO: rename path to "/:collection" and add express validator
    try {
      const file = exportService.getZipFile(Page);

      if (file == null) {
        throw new Error('the target file does not exist');
      }

      return res.download(file);
    }
    catch (err) {
      // TODO: use ApiV3Error
      logger.error(err);
      return res.status(500).send({ status: 'ERROR' });
    }
  });

  /**
   * @swagger
   *
   *  /export/pages:
   *    post:
   *      tags: [Export]
   *      description: generate a zipped json for page collection
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: a zip file is generated
   *          content:
   *            application/json:
   */
  router.post('/pages', async(req, res) => {
    // TODO: rename path to "/:collection" and add express validator
    try {
      const file = await exportService.exportCollection(Page);
      // TODO: use res.apiv3
      return res.status(200).json({
        ok: true,
        collection: [Page.collection.collectionName],
        file: path.basename(file),
      });
    }
    catch (err) {
      // TODO: use ApiV3Error
      logger.error(err);
      return res.status(500).send({ status: 'ERROR' });
    }
  });

  /**
   * @swagger
   *
   *  /export/pages:
   *    delete:
   *      tags: [Export]
   *      description: unlink a json and zip file for page collection
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: the json and zip file are removed
   *          content:
   *            application/json:
   */
  // router.delete('/pages', async(req, res) => {
  //   // TODO: rename path to "/:collection" and add express validator
  //   try {
  //     // remove .json and .zip for collection
  //     // TODO: use res.apiv3
  //     return res.status(200).send({ status: 'DONE' });
  //   }
  //   catch (err) {
  //     // TODO: use ApiV3Error
  //     logger.error(err);
  //     return res.status(500).send({ status: 'ERROR' });
  //   }
  // });

  return router;
};
