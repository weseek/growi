import { SupportedAction } from '~/interfaces/activity';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import loggerFactory from '~/utils/logger';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';


const logger = loggerFactory('growi:routes:apiv3:export');
const fs = require('fs');

const express = require('express');
const { param } = require('express-validator');

const router = express.Router();

/* {"ok":true,"status":{"zipFileStats":[{"meta":{"version":"7.0.23","url":"https://wiki.moongift.co.jp","passwordSeed":"changeme","exportedAt":"2024-12-11T12:18:33.152Z","envVars":{"ELASTICSEARCH_URI":"http://elasticsearch:9200/growi"}},"fileName":"MOONGIFT-1733919513254.growi.zip","zipFilePath":"/opt/growi/apps/app/tmp/downloads/MOONGIFT-1733919513254.growi.zip","fileStat":{"dev":69,"mode":33188,"nlink":1,"uid":1000,"gid":1000,"rdev":0,"blksize":4096,"ino":1967731,"size":318007,"blocks":624,"atimeMs":1733919513370.2546,"mtimeMs":1733919513362.2546,"ctimeMs":1733919513362.2546,"birthtimeMs":1733919513262.2546,"atime":"2024-12-11T12:18:33.370Z","mtime":"2024-12-11T12:18:33.362Z","ctime":"2024-12-11T12:18:33.362Z","birthtime":"2024-12-11T12:18:33.262Z"},"innerFileStats":[{"fileName":"pages.json","collectionName":"pages"},{"fileName":"slackappintegrations.json","collectionName":"slackappintegrations"},{"fileName":"tags.json","collectionName":"tags"},{"fileName":"bookmarks.json","collectionName":"bookmarks"},{"fileName":"userregistrationorders.json","collectionName":"userregistrationorders"},{"fileName":"configs.json","collectionName":"configs"},{"fileName":"revisions.json","collectionName":"revisions"},{"fileName":"pageoperations.json","collectionName":"pageoperations"},{"fileName":"useruisettings.json","collectionName":"useruisettings"},{"fileName":"inappnotifications.json","collectionName":"inappnotifications"},{"fileName":"namedqueries.json","collectionName":"namedqueries"},{"fileName":"growiplugins.json","collectionName":"growiplugins"},{"fileName":"activities.json","collectionName":"activities"},{"fileName":"editorsettings.json","collectionName":"editorsettings"},{"fileName":"updateposts.json","collectionName":"updateposts"},{"fileName":"comments.json","collectionName":"comments"},{"fileName":"globalnotificationsettings.json","collectionName":"globalnotificationsettings"},{"fileName":"externalusergroups.json","collectionName":"externalusergroups"},{"fileName":"migrations.json","collectionName":"migrations"},{"fileName":"pageredirects.json","collectionName":"pageredirects"},{"fileName":"passwordresetorders.json","collectionName":"passwordresetorders"},{"fileName":"proactivequestionnaireanswers.json","collectionName":"proactivequestionnaireanswers"},{"fileName":"externalaccounts.json","collectionName":"externalaccounts"},{"fileName":"bookmarkfolders.json","collectionName":"bookmarkfolders"},{"fileName":"subscriptions.json","collectionName":"subscriptions"},{"fileName":"sharelinks.json","collectionName":"sharelinks"},{"fileName":"usergrouprelations.json","collectionName":"usergrouprelations"},{"fileName":"users.json","collectionName":"users"},{"fileName":"attachments.json","collectionName":"attachments"},{"fileName":"usergroups.json","collectionName":"usergroups"},{"fileName":"questionnaireanswers.json","collectionName":"questionnaireanswers"},{"fileName":"questionnaireorders.json","collectionName":"questionnaireorders"},{"fileName":"externalusergrouprelations.json","collectionName":"externalusergrouprelations"},{"fileName":"inappnotificationsettings.json","collectionName":"inappnotificationsettings"},{"fileName":"questionnaireanswerstatuses.json","collectionName":"questionnaireanswerstatuses"},{"fileName":"pagetagrelations.json","collectionName":"pagetagrelations"}]}],"isExporting":false,"progressList":null}}
*/

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      ExportStatus:
 *        type: object
 *        properties:
 *          zipFileStats:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/ExportZipFileStat'
 *          isExporting:
 *            type: boolean
 *          progressList:
 *            type: [array, null]
 *            items:
 *              type: string
 *      ExportZipFileStat:
 *        type: object
 *        properties:
 *          meta:
 *            $ref: '#/components/schemas/ExportMeta'
 *          fileName:
 *            type: string
 *          zipFilePath:
 *            type: string
 *          fileStat:
 *            $ref: '#/components/schemas/ExportFileStat'
 *          innerFileStats:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/ExportInnerFileStat'
 *      ExportMeta:
 *        type: object
 *        properties:
 *          version:
 *            type: string
 *          url:
 *            type: string
 *          passwordSeed:
 *            type: string
 *          exportedAt:
 *            type: string
 *            format: date-time
 *          envVars:
 *            type: object
 *            additionalProperties:
 *              type: string
 *      ExportFileStat:
 *        type: object
 *        properties:
 *          dev:
 *            type: integer
 *          mode:
 *            type: integer
 *          nlink:
 *            type: integer
 *          uid:
 *            type: integer
 *          gid:
 *            type: integer
 *          rdev:
 *            type: integer
 *          blksize:
 *            type: integer
 *          ino:
 *            type: integer
 *          size:
 *            type: integer
 *          blocks:
 *            type: integer
 *          atime:
 *            type: string
 *            format: date-time
 *          mtime:
 *            type: string
 *            format: date-time
 *          ctime:
 *            type: string
 *            format: date-time
 *          birthtime:
 *            type: string
 *            format: date-time
 *      ExportInnerFileStat:
 *        type: object
 *        properties:
 *          fileName:
 *            type: string
 *          collectionName:
 *            type: string
 *          meta:
 *           progressList:
 *             type: array
 *             items:
 *               type: object
 *               description: progress data for each exporting collections
 *           isExporting:
 *             type: boolean
 *             description: whether the current exporting job exists or not
 */

module.exports = (crowi) => {
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
   *                  ok:
   *                    type: boolean
   *                    description: whether the request is succeeded or not
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
   *      requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              properties:
   *                collections:
   *                  type: array
   *                  items:
   *                    type: string
   *                    description: the collections to export
   *                    example: ["pages", "tags"]
   *      responses:
   *        200:
   *          description: a zip file is generated
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  ok:
   *                    type: boolean
   *                    description: whether the request is succeeded
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
   *                properties:
   *                  ok:
   *                    type: boolean
   *                    description: whether the request is succeeded
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
