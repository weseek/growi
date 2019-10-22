const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:import'); // eslint-disable-line no-unused-vars

const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { ObjectId } = require('mongoose').Types;

const express = require('express');

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
   * defined overwrite params for each collection
   * all imported documents are overwriten by this value
   * each value can be any value or a function (_value, { _document, key, schema }) { return newValue }
   *
   * @param {object} Model instance of mongoose model
   * @param {object} req request object
   * @return {object} document to be persisted
   */
  const overwriteParamsFn = async(Model, schema, req) => {
    const collectionName = Model.collection.name;

    /* eslint-disable no-case-declarations */
    switch (Model.collection.collectionName) {
      case 'pages':
        // TODO: use schema and req to generate overwriteParams
        // e.g. { creator: schema.creator === 'me' ? ObjectId(req.user._id) : importService.keepOriginal }
        return {
          status: 'published', // FIXME when importing users and user groups
          grant: 1, // FIXME when importing users and user groups
          grantedUsers: [], // FIXME when importing users and user groups
          grantedGroup: null, // FIXME when importing users and user groups
          creator: ObjectId(req.user._id), // FIXME when importing users
          lastUpdateUser: ObjectId(req.user._id), // FIXME when importing users
          liker: [], // FIXME when importing users
          seenUsers: [], // FIXME when importing users
          commentCount: 0, // FIXME when importing comments
          extended: {}, // FIXME when ?
          pageIdOnHackmd: undefined, // FIXME when importing hackmd?
          revisionHackmdSynced: undefined, // FIXME when importing hackmd?
          hasDraftOnHackmd: undefined, // FIXME when importing hackmd?
        };
      // case 'revisoins':
      //   return {};
      // case 'users':
      //   return {};
      // ... add more cases
      default:
        throw new Error(`cannot find a model for collection name "${collectionName}"`);
    }
    /* eslint-enable no-case-declarations */
  };

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
    const status = await importService.getStatus();

    // TODO: use res.apiv3
    return res.json({
      ok: true,
      status,
    });
  });

  /**
   * @swagger
   *
   *  /import:
   *    post:
   *      tags: [Import]
   *      description: import a collection from a zipped json
   *      responses:
   *        200:
   *          description: the data is successfully imported
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  results:
   *                    type: array
   *                    items:
   *                      type: object
   *                      description: collectionName, insertedIds, failedIds
   */
  router.post('/', accessTokenParser, loginRequired, adminRequired, csrf, async(req, res) => {
    // TODO: add express validator

    const { fileName, collections, schema } = req.body;
    const zipFile = importService.getFile(fileName);

    // unzip
    await importService.unzip(zipFile);
    // eslint-disable-next-line no-unused-vars
    const { meta, fileStats, innerFileStats } = await growiBridgeService.parseZipFile(zipFile);

    // delete zip file after unzipping and parsing it
    fs.unlinkSync(zipFile);

    // filter innerFileStats
    const filteredInnerFileStats = innerFileStats.filter(({ fileName, collectionName, size }) => { return collections.includes(collectionName) });

    try {
      // validate with meta.json
      importService.validate(meta);

      const results = await Promise.all(filteredInnerFileStats.map(async({ fileName, collectionName, size }) => {
        const Model = growiBridgeService.getModelFromCollectionName(collectionName);
        const jsonFile = importService.getFile(fileName);

        let overwriteParams;
        if (overwriteParamsFn[collectionName] != null) {
          // await in case overwriteParamsFn[collection] is a Promise
          overwriteParams = await overwriteParamsFn(Model, schema[collectionName], req);
        }

        const { insertedIds, failedIds } = await importService.import(Model, jsonFile, overwriteParams);

        return {
          collectionName,
          insertedIds,
          failedIds,
        };
      }));

      // TODO: use res.apiv3
      return res.send({ ok: true, results });
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

      // TODO: use res.apiv3
      return res.send({
        ok: true,
        data,
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
   *  /import/all
   *    post:
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
