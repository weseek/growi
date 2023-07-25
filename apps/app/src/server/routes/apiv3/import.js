import { ErrorV3 } from '@growi/core/dist/models';

import { SupportedAction } from '~/interfaces/activity';
import loggerFactory from '~/utils/logger';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';

import overwriteParamsAttachmentFilesChunks from './overwrite-params/attachmentFiles.chunks';
import overwriteParamsPages from './overwrite-params/pages';
import overwriteParamsRevisions from './overwrite-params/revisions';


const logger = loggerFactory('growi:routes:apiv3:import'); // eslint-disable-line no-unused-vars

const path = require('path');

const express = require('express');
const multer = require('multer');


const GrowiArchiveImportOption = require('~/models/admin/growi-archive-import-option');


const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Import
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      ImportStatus:
 *        description: ImportStatus
 *        type: object
 *        properties:
 *          zipFileStat:
 *            type: object
 *            description: the property object
 *          progressList:
 *            type: array
 *            items:
 *              type: object
 *              description: progress data for each exporting collections
 *          isImporting:
 *            type: boolean
 *            description: whether the current importing job exists or not
 */

/**
 * generate overwrite params with overwrite-params/* modules
 * @param {string} collectionName
 * @param {string} operatorUserId Operator user id
 * @param {GrowiArchiveImportOption} options GrowiArchiveImportOption instance
 */
export const generateOverwriteParams = (collectionName, operatorUserId, options) => {
  switch (collectionName) {
    case 'pages':
      return overwriteParamsPages(operatorUserId, options);
    case 'revisions':
      return overwriteParamsRevisions(operatorUserId, options);
    case 'attachmentFiles.chunks':
      return overwriteParamsAttachmentFilesChunks(operatorUserId, options);
    default:
      return {};
  }
};

export default function route(crowi) {
  const { growiBridgeService, importService, socketIoService } = crowi;
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const addActivity = generateAddActivityMiddleware(crowi);

  const adminEvent = crowi.event('admin');
  const activityEvent = crowi.event('activity');

  // setup event
  adminEvent.on('onProgressForImport', (data) => {
    socketIoService.getAdminSocket().emit('admin:onProgressForImport', data);
  });
  adminEvent.on('onTerminateForImport', (data) => {
    socketIoService.getAdminSocket().emit('admin:onTerminateForImport', data);
  });
  adminEvent.on('onErrorForImport', (data) => {
    socketIoService.getAdminSocket().emit('admin:onErrorForImport', data);
  });

  const uploads = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, importService.baseDir);
      },
      filename(req, file, cb) {
        // to prevent hashing the file name. files with same name will be overwritten.
        cb(null, file.originalname);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (path.extname(file.originalname) === '.zip') {
        return cb(null, true);
      }
      cb(new Error('Only ".zip" is allowed'));
    },
  });

  /**
   * @swagger
   *
   *  /import:
   *    get:
   *      tags: [Import]
   *      operationId: getImportSettingsParams
   *      summary: /import
   *      description: Get import settings params
   *      responses:
   *        200:
   *          description: import settings params
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  importSettingsParams:
   *                    type: object
   *                    description: import settings params
   */
  router.get('/', accessTokenParser, loginRequired, adminRequired, async(req, res) => {
    try {
      const importSettingsParams = {
        esaTeamName: await crowi.configManager.getConfig('crowi', 'importer:esa:team_name'),
        esaAccessToken: await crowi.configManager.getConfig('crowi', 'importer:esa:access_token'),
        qiitaTeamName: await crowi.configManager.getConfig('crowi', 'importer:qiita:team_name'),
        qiitaAccessToken: await crowi.configManager.getConfig('crowi', 'importer:qiita:access_token'),
      };
      return res.apiv3({
        importSettingsParams,
      });
    }
    catch (err) {
      return res.apiv3Err(err, 500);
    }
  });

  /**
   * @swagger
   *
   *  /import/status:
   *    get:
   *      tags: [Import]
   *      operationId: getImportStatus
   *      summary: /import/status
   *      description: Get properties of stored zip files for import
   *      responses:
   *        200:
   *          description: the zip file statuses
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  status:
   *                    $ref: '#/components/schemas/ImportStatus'
   */
  router.get('/status', accessTokenParser, loginRequired, adminRequired, async(req, res) => {
    try {
      const status = await importService.getStatus();
      return res.apiv3(status);
    }
    catch (err) {
      return res.apiv3Err(err, 500);
    }
  });

  /**
   * @swagger
   *
   *  /import:
   *    post:
   *      tags: [Import]
   *      operationId: executeImport
   *      summary: /import
   *      description: import a collection from a zipped json
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                fileName:
   *                  description: the file name of zip file
   *                  type: string
   *                collections:
   *                  description: collection names to import
   *                  type: array
   *                  items:
   *                    type: string
   *                optionsMap:
   *                  description: |
   *                    the map object of importing option that have collection name as the key
   *                  additionalProperties:
   *                    type: object
   *                    properties:
   *                      mode:
   *                        description: Import mode
   *                        type: string
   *                        enum: [insert, upsert, flushAndInsert]
   *      responses:
   *        200:
   *          description: Import process has requested
   */
  router.post('/', accessTokenParser, loginRequired, adminRequired, addActivity, async(req, res) => {
    // TODO: add express validator
    const { fileName, collections, optionsMap } = req.body;

    // pages collection can only be imported by upsert if isV5Compatible is true
    const isV5Compatible = crowi.configManager.getConfig('crowi', 'app:isV5Compatible');
    const isImportPagesCollection = collections.includes('pages');
    if (isV5Compatible && isImportPagesCollection) {
      const option = new GrowiArchiveImportOption(null, optionsMap.pages);
      if (option.mode !== 'upsert') {
        return res.apiv3Err(new ErrorV3('Upsert is only available for importing pages collection.', 'only_upsert_available'));
      }
    }

    const isMaintenanceMode = crowi.appService.isMaintenanceMode();
    if (!isMaintenanceMode) {
      return res.apiv3Err(new ErrorV3('GROWI is not maintenance mode. To import data, please activate the maintenance mode first.', 'not_maintenance_mode'));
    }


    const zipFile = importService.getFile(fileName);

    // return response first
    res.apiv3();

    /*
     * unzip, parse
     */
    let meta = null;
    let fileStatsToImport = null;
    try {
      // unzip
      await importService.unzip(zipFile);

      // eslint-disable-next-line no-unused-vars
      const { meta: parsedMeta, fileStats, innerFileStats } = await growiBridgeService.parseZipFile(zipFile);
      meta = parsedMeta;

      // filter innerFileStats
      fileStatsToImport = innerFileStats.filter(({ fileName, collectionName, size }) => {
        return collections.includes(collectionName);
      });
    }
    catch (err) {
      logger.error(err);
      adminEvent.emit('onErrorForImport', { message: err.message });
      return;
    }

    /*
     * validate with meta.json
     */
    try {
      importService.validate(meta);
    }
    catch (err) {
      logger.error(err);
      adminEvent.emit('onErrorForImport', { message: err.message });
      return;
    }

    // generate maps of ImportSettings to import
    const importSettingsMap = {};
    fileStatsToImport.forEach(({ fileName, collectionName }) => {
      // instanciate GrowiArchiveImportOption
      const options = new GrowiArchiveImportOption(null, optionsMap[collectionName]);

      // generate options
      const importSettings = importService.generateImportSettings(options.mode);
      importSettings.jsonFileName = fileName;

      // generate overwrite params
      importSettings.overwriteParams = generateOverwriteParams(collectionName, req.user._id, options);

      importSettingsMap[collectionName] = importSettings;
    });

    /*
     * import
     */
    try {
      importService.import(collections, importSettingsMap);

      const parameters = { action: SupportedAction.ACTION_ADMIN_GROWI_DATA_IMPORTED };
      activityEvent.emit('update', res.locals.activity._id, parameters);
    }
    catch (err) {
      logger.error(err);
      adminEvent.emit('onErrorForImport', { message: err.message });
    }
  });

  /**
   * @swagger
   *
   *  /import/upload:
   *    post:
   *      tags: [Import]
   *      operationId: uploadImport
   *      summary: /import/upload
   *      description: upload a zip file
   *      responses:
   *        200:
   *          description: the file is uploaded
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  meta:
   *                    type: object
   *                    description: the meta data of the uploaded file
   *                  fileName:
   *                    type: string
   *                    description: the base name of the uploaded file
   *                  fileStats:
   *                    type: array
   *                    items:
   *                      type: object
   *                      description: the property of each extracted file
   */
  router.post('/upload', uploads.single('file'), accessTokenParser, loginRequired, adminRequired, addActivity, async(req, res) => {
    const { file } = req;
    const zipFile = importService.getFile(file.filename);
    let data = null;

    try {
      data = await growiBridgeService.parseZipFile(zipFile);
    }
    catch (err) {
      // TODO: use ApiV3Error
      logger.error(err);
      return res.status(500).send({ status: 'ERROR' });
    }
    try {
      // validate with meta.json
      importService.validate(data.meta);

      const parameters = { action: SupportedAction.ACTION_ADMIN_ARCHIVE_DATA_UPLOAD };
      activityEvent.emit('update', res.locals.activity._id, parameters);

      return res.apiv3(data);
    }
    catch {
      const msg = 'The version of this GROWI and the uploaded GROWI data are not the same';
      const validationErr = 'versions-are-not-met';
      return res.apiv3Err(new ErrorV3(msg, validationErr), 500);
    }
  });

  /**
   * @swagger
   *
   *  /import/all:
   *    delete:
   *      tags: [Import]
   *      operationId: deleteImportAll
   *      summary: /import/all
   *      description: Delete all zip files
   *      responses:
   *        200:
   *          description: all files are deleted
   */
  router.delete('/all', accessTokenParser, loginRequired, adminRequired, async(req, res) => {
    try {
      importService.deleteAllZipFiles();

      return res.apiv3();
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;
}
