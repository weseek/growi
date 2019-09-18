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
   *  /export/:collection:
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
  router.get('/:collection', async(req, res) => {
    // TODO: add express validator
    try {
      const { collection: collectionName } = req.params;
      // get model for collection
      const Model = exportService.getModelFromCollectionName(collectionName);
      // get zip file path
      const zipFile = exportService.getZipFile(Model);

      return res.download(zipFile);
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
  router.post('/:collection', async(req, res) => {
    // TODO: add express validator
    try {
      const { collection: collectionName } = req.params;
      // get model for collection
      const Model = exportService.getModelFromCollectionName(collectionName);
      // export into json
      const jsonFile = await exportService.exportCollectionToJson(Model);
      // zip json
      const zipFile = await exportService.zipSingleFile(jsonFile);

      // TODO: use res.apiv3
      return res.status(200).json({
        ok: true,
        collection: [Model.collection.collectionName],
        file: path.basename(zipFile),
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
   *  /export:
   *    post:
   *      tags: [Export]
   *      description: generate a zipped json for multiple collections
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: a zip file is generated
   *          content:
   *            application/json:
   */
  router.post('/', async(req, res) => {
    // TODO: add express validator
    try {
      const { collections } = req.body;
      // get model for collection
      const models = collections.map(collectionName => exportService.getModelFromCollectionName(collectionName));
      // export into json
      const jsonFiles = await exportService.exportMultipleCollectionsToJsons(models);
      // zip json
      const configs = jsonFiles.map((jsonFile) => { return { from: jsonFile, as: path.basename(jsonFile) } });
      const zipFile = await exportService.zipMultipleFiles(configs);

      // TODO: use res.apiv3
      return res.status(200).json({
        ok: true,
        // collection: [Model.collection.collectionName],
        file: path.basename(zipFile),
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
   *  /export/:collection:
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
  // router.delete('/:collection', async(req, res) => {
  //   // TODO: add express validator
  //   try {
  //     const { collection: collectionName } = req.params;
  //     // get model for collection
  //     const Model = exportService.getModelFromCollectionName(collectionName);
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
