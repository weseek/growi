const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:import'); // eslint-disable-line no-unused-vars

const path = require('path');
const multer = require('multer');

// eslint-disable-next-line no-unused-vars
const { ObjectId } = require('mongoose').Types;

const express = require('express');

const GrowiArchiveImportOption = require('@commons/models/admin/growi-archive-import-option');


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

module.exports = (crowi) => {
  const { growiBridgeService, importService } = crowi;
  const accessTokenParser = require('../../middleware/access-token-parser')(crowi);
  const loginRequired = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  this.adminEvent = crowi.event('admin');

  // setup event
  this.adminEvent.on('onProgressForImport', (data) => {
    crowi.getIo().sockets.emit('admin:onProgressForImport', data);
  });
  this.adminEvent.on('onTerminateForImport', (data) => {
    crowi.getIo().sockets.emit('admin:onTerminateForImport', data);
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
   *  /import/status:
   *    get:
   *      tags: [Import]
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
      return res.apiv3Err(err, 500);
    }

    /*
     * validate with meta.json
     */
    try {
      importService.validate(meta);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err);
    }

    // generate maps of ImportSettings to import
    const importSettingsMap = {};
    fileStatsToImport.forEach(({ fileName, collectionName }) => {
      // instanciate GrowiArchiveImportOption
      const options = new GrowiArchiveImportOption(optionsMap[collectionName]);

      // generate options
      const importSettings = importService.generateImportSettings(options.mode);
      importSettings.jsonFileName = fileName;

      /*
       * define overwrite params for each collection
       * all imported documents are overwriten by this value
       * each value can be any value or a function (value, { document, schema, propertyName }) { return newValue }
       */
      switch (collectionName) {
        case 'pages':
          importSettings.overwriteParams = require('./overwrite-params/pages')(req, options);
          break;
        default:
          importSettings.overwriteParams = {};
      }

      importSettingsMap[collectionName] = importSettings;
    });

    /*
     * import
     */
    try {
      importService.import(collections, importSettingsMap);
      return res.apiv3();
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err, 500);
    }
  });

  /**
   * @swagger
   *
   *  /import/upload:
   *    post:
   *      tags: [Import]
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

    try {
      const data = await growiBridgeService.parseZipFile(zipFile);

      // validate with meta.json
      importService.validate(data.meta);

      return res.apiv3(data);
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
   *  /import/all:
   *    delete:
   *      tags: [Import]
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
