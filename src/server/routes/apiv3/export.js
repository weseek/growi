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
  const { growiBridgeService, exportService } = crowi;

  /**
   * @swagger
   *
   *  /export/status:
   *    get:
   *      tags: [Export]
   *      description: get properties of zip files for export
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: export cache status
   *          content:
   *            application/json:
   */
  router.get('/status', async(req, res) => {
    const zipFileStats = await exportService.getStatus();

    // TODO: use res.apiv3
    return res.json({ ok: true, zipFileStats });
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
      const models = collections.map(collectionName => growiBridgeService.getModelFromCollectionName(collectionName));

      const [metaJson, jsonFiles] = await Promise.all([
        exportService.createMetaJson(),
        exportService.exportMultipleCollectionsToJsons(models),
      ]);

      // zip json
      const configs = jsonFiles.map((jsonFile) => { return { from: jsonFile, as: path.basename(jsonFile) } });
      // add meta.json in zip
      configs.push({ from: metaJson, as: path.basename(metaJson) });
      // exec zip
      const zipFile = await exportService.zipFiles(configs);
      // get stats for the zip file
      const zipFileStat = await growiBridgeService.parseZipFile(zipFile);

      // TODO: use res.apiv3
      return res.status(200).json({
        ok: true,
        zipFileStat,
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
   *    delete:
   *      tags: [Export]
   *      description: unlink all json and zip files for exports
   *      produces:
   *        - application/json
   *      parameters:
   *        - name: fileName
   *          in: path
   *          description: file name of zip file
   *          schema:
   *            type: string
   *      responses:
   *        200:
   *          description: the json and zip file are deleted
   *          content:
   *            application/json:
   */
  router.delete('/:fileName', async(req, res) => {
    // TODO: add express validator
    const { fileName } = req.params;

    try {
      const zipFile = exportService.getFile(fileName);
      exportService.deleteZipFile(zipFile);

      // TODO: use res.apiv3
      return res.status(200).send({ ok: true });
    }
    catch (err) {
      // TODO: use ApiV3Error
      logger.error(err);
      return res.status(500).send({ ok: false });
    }
  });

  return router;
};
