const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:export');
const fs = require('fs');

const express = require('express');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Export
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middleware/access-token-parser')(crowi);
  const loginRequired = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { growiBridgeService, exportService } = crowi;

  this.adminEvent = crowi.event('admin');

  /**
   * @swagger
   *
   *  /export/status:
   *    get:
   *      tags: [Export]
   *      description: get properties of stored zip files for export
   *      responses:
   *        200:
   *          description: the zip file statuses
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  zipFileStats:
   *                    type: array
   *                    items:
   *                      type: object
   *                      description: the property of each file
   */
  router.get('/status', accessTokenParser, loginRequired, adminRequired, async(req, res) => {
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
   *      description: generate zipped jsons for collections
   *      responses:
   *        200:
   *          description: a zip file is generated
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  zipFileStat:
   *                    type: object
   *                    description: the property of the zip file
   */
  router.post('/', accessTokenParser, loginRequired, adminRequired, csrf, async(req, res) => {
    // TODO: add express validator
    try {
      const { collections } = req.body;
      // get model for collection
      const models = collections.map(collectionName => growiBridgeService.getModelFromCollectionName(collectionName));

      exportService.exportCollectionsToZippedJson(models);

      // setup event
      this.adminEvent.on('onProgressForExport', (total, current) => {
        crowi.getIo().sockets.emit('admin:onProgressForExport', { total, current });
      });
      this.adminEvent.on('onTerminateForExport', (total, current) => {
        crowi.getIo().sockets.emit('admin:onTerminateForExport', { total, current });
      });

      // TODO: use res.apiv3
      return res.status(200).json({
        ok: true,
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
   *  /export/{fileName}:
   *    delete:
   *      tags: [Export]
   *      description: delete the file
   *      parameters:
   *        - name: fileName
   *          in: path
   *          description: the file name of zip file
   *          required: true
   *          schema:
   *            type: string
   *      responses:
   *        200:
   *          description: the file is deleted
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   */
  router.delete('/:fileName', accessTokenParser, loginRequired, adminRequired, csrf, async(req, res) => {
    // TODO: add express validator
    const { fileName } = req.params;

    try {
      const zipFile = exportService.getFile(fileName);
      fs.unlinkSync(zipFile);

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
