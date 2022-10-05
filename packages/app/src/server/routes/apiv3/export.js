import { SupportedAction } from '~/interfaces/activity';
import loggerFactory from '~/utils/logger';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';


const logger = loggerFactory('growi:routes:apiv3:export');
const fs = require('fs');

const express = require('express');
const { param } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Export
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      ExportStatus:
 *        description: ExportStatus
 *        type: object
 *        properties:
 *          zipFileStats:
 *            type: array
 *            items:
 *              type: object
 *              description: the property of each file
 *          progressList:
 *            type: array
 *            items:
 *              type: object
 *              description: progress data for each exporting collections
 *          isExporting:
 *            type: boolean
 *            description: whether the current exporting job exists or not
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const addActivity = generateAddActivityMiddleware(crowi);

  const { exportService, socketIoService } = crowi;

  const activityEvent = crowi.event('activity');
  const adminEvent = crowi.event('admin');

  // setup event
  adminEvent.on('onProgressForExport', (data) => {
    socketIoService.getAdminSocket().emit('admin:onProgressForExport', data);
  });
  adminEvent.on('onStartZippingForExport', (data) => {
    socketIoService.getAdminSocket().emit('admin:onStartZippingForExport', data);
  });
  adminEvent.on('onTerminateForExport', (data) => {
    socketIoService.getAdminSocket().emit('admin:onTerminateForExport', data);
  });

  const validator = {
    deleteFile: [
      // https://regex101.com/r/mD4eZs/6
      // prevent from unexpecting attack doing delete file (path traversal attack)
      param('fileName').not().matches(/(\.\.\/|\.\.\\)/),
    ],
  };


  /**
   * @swagger
   *
   *  /export/status:
   *    get:
   *      tags: [Export]
   *      operationId: getExportStatus
   *      summary: /export/status
   *      description: get properties of stored zip files for export
   *      responses:
   *        200:
   *          description: the zip file statuses
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  status:
   *                    $ref: '#/components/schemas/ExportStatus'
   */
  router.get('/status', accessTokenParser, loginRequired, adminRequired, async(req, res) => {
    const status = await exportService.getStatus();

    // TODO: use res.apiv3
    return res.json({
      ok: true,
      status,
    });
  });

  /**
   * @swagger
   *
   *  /export:
   *    post:
   *      tags: [Export]
   *      operationId: createExport
   *      summary: /export
   *      description: generate zipped jsons for collections
   *      responses:
   *        200:
   *          description: a zip file is generated
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  status:
   *                    $ref: '#/components/schemas/ExportStatus'
   */
  router.post('/', accessTokenParser, loginRequired, adminRequired, addActivity, async(req, res) => {
    // TODO: add express validator
    try {
      const { collections } = req.body;

      exportService.export(collections);

      const parameters = { action: SupportedAction.ACTION_ADMIN_ARCHIVE_DATA_CREATE };
      activityEvent.emit('update', res.locals.activity._id, parameters);

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
   *      operationId: deleteExport
   *      summary: /export/{fileName}
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
  router.delete('/:fileName', accessTokenParser, loginRequired, adminRequired, validator.deleteFile, apiV3FormValidator, addActivity, async(req, res) => {
    // TODO: add express validator
    const { fileName } = req.params;

    try {
      const zipFile = exportService.getFile(fileName);
      fs.unlinkSync(zipFile);
      const parameters = { action: SupportedAction.ACTION_ADMIN_ARCHIVE_DATA_DELETE };
      activityEvent.emit('update', res.locals.activity._id, parameters);

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
