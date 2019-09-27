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

module.exports = (crowi) => {
  const { growiBridgeService, importService } = crowi;
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
    const { collectionName } = Model.collection;

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
   *                type: object
   */
  router.post('/', async(req, res) => {
    // TODO: add express validator

    const { fileName, collections, schema } = req.body;
    const zipFile = importService.getFile(fileName);

    // unzip
    await importService.unzip(zipFile);
    // eslint-disable-next-line no-unused-vars
    const { meta, fileStats } = await growiBridgeService.parseZipFile(zipFile);

    // delete zip file after unzipping and parsing it
    fs.unlinkSync(zipFile);

    // filter fileStats
    const filteredFileStats = fileStats.filter(({ fileName, collectionName, size }) => { return collections.includes(collectionName) });

    try {
      // validate with meta.json
      importService.validate(meta);

      const results = await Promise.all(filteredFileStats.map(async({ fileName, collectionName, size }) => {
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

      // convert to
      // {
      //   [collectionName1]: {
      //     insertedIds: [...],
      //     failedIds: [...],
      //   },
      //   [collectionName2]: {
      //     insertedIds: [...],
      //     failedIds: [...],
      //   },
      // }
      const result = {};
      for (const { collectionName, insertedIds, failedIds } of results) {
        result[collectionName] = { insertedIds, failedIds };
      }

      // TODO: use res.apiv3
      return res.send({ ok: true, result });
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
  router.post('/upload', uploads.single('file'), async(req, res) => {
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
   *  /import/{fileName}:
   *    post:
   *      tags: [Import]
   *      description: delete a zip file
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
  router.delete('/:fileName', async(req, res) => {
    const { fileName } = req.params;

    try {
      const zipFile = importService.getFile(fileName);
      fs.unlinkSync(zipFile);

      // TODO: use res.apiv3
      return res.send({
        ok: true,
      });
    }
    catch (err) {
      // TODO: use ApiV3Error
      logger.error(err);
      return res.status(500).send({ status: 'ERROR' });
    }
  });

  return router;
};
