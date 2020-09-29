const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:import'); // eslint-disable-line no-unused-vars

const path = require('path');
const multer = require('multer');

const express = require('express');

const GrowiArchiveImportOption = require('@commons/models/admin/growi-archive-import-option');
const ErrorV3 = require('../../models/vo/error-apiv3');


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
 * @param {object} req Request Object
 * @param {GrowiArchiveImportOption} options GrowiArchiveImportOption instance
 */
const generateOverwriteParams = (collectionName, req, options) => {
  switch (collectionName) {
    case 'pages':
      return require('./overwrite-params/pages')(req, options);
    case 'revisions':
      return require('./overwrite-params/revisions')(req, options);
    case 'attachmentFiles.chunks':
      return require('./overwrite-params/attachmentFiles.chunks')(req, options);
    default:
      return {};
  }
};

module.exports = (crowi) => {
  const { growiBridgeService, importService, socketIoService } = crowi;
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);

  this.adminEvent = crowi.event('admin');

  // setup event
  this.adminEvent.on('onProgressForImport', (data) => {
    socketIoService.getAdminSocket().emit('admin:onProgressForImport', data);
  });
  this.adminEvent.on('onTerminateForImport', (data) => {
    socketIoService.getAdminSocket().emit('admin:onTerminateForImport', data);
  });
  this.adminEvent.on('onErrorForImport', (data) => {
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
  router.post('/', accessTokenParser, loginRequired, adminRequired, csrf, async(req, res) => {
    // TODO: add express validator

    const { fileName, collections, optionsMap } = req.body;
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
      this.adminEvent.emit('onErrorForImport', { message: err.message });
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
      this.adminEvent.emit('onErrorForImport', { message: err.message });
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
      importSettings.overwriteParams = generateOverwriteParams(collectionName, req, options);

      importSettingsMap[collectionName] = importSettings;
    });

    /*
     * import
     */
    try {
      importService.import(collections, importSettingsMap);
    }
    catch (err) {
      logger.error(err);
      this.adminEvent.emit('onErrorForImport', { message: err.message });
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
  router.post('/upload', uploads.single('file'), accessTokenParser, loginRequired, adminRequired, csrf, async(req, res) => {
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
      return res.apiv3(data);
    }
    catch {
      const msg = 'the version of this growi and the growi that exported the data are not met';
      const varidationErr = 'versions-are-not-met';
      return res.apiv3Err(new ErrorV3(msg, varidationErr), 500);
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
  router.delete('/all', accessTokenParser, loginRequired, adminRequired, csrf, async(req, res) => {
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
};
