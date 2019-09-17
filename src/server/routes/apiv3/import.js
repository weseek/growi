const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:import'); // eslint-disable-line no-unused-vars
const path = require('path');
const multer = require('multer');
const autoReap = require('multer-autoreap');
const { ObjectId } = require('mongoose').Types;

const express = require('express');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Import
 */

module.exports = (crowi) => {
  const { importService } = crowi;
  const uploads = multer({
    dest: importService.baseDir,
    fileFilter: (req, file, cb) => {
      if (path.extname(file.originalname) === '.zip') {
        return cb(null, true);
      }
      cb(new Error('Only ".zip" is allowed'));
    },
  });

  /**
   * defined overwrite option for each collection
   * all imported documents are overwriten by this value
   * may use async function
   *
   * @param {object} req
   * @return {object} document to be persisted
   */
  const overwriteParamsFn = {};
  overwriteParamsFn.pages = (req) => {
    return {
      creator: ObjectId(req.user._id), // FIXME when importing users
      lastUpdateUser: ObjectId(req.user._id), // FIXME when importing users
    };
  };

  /**
   * @swagger
   *
   *  /export/:collection:
   *    post:
   *      tags: [Import]
   *      description: import a collection from a zipped json
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: data is successfully imported
   *          content:
   *            application/json:
   */
  router.post('/:collection', uploads.single('file'), autoReap, async(req, res) => {
    // TODO: add express validator
    const { file } = req;
    const { collection } = req.params;
    const Model = importService.getModelFromCollectionName(collection);
    const zipFilePath = path.join(file.destination, file.filename);

    try {
      let overwriteParams;
      if (overwriteParamsFn[collection] != null) {
        // await in case overwriteParamsFn[collection] is a Promise
        overwriteParams = await overwriteParamsFn[collection](req);
      }

      await importService.importFromZip(Model, zipFilePath, overwriteParams);

      // TODO: use res.apiv3
      return res.send({ status: 'OK' });
    }
    catch (err) {
      // TODO: use ApiV3Error
      logger.error(err);
      return res.status(500).send({ status: 'ERROR' });
    }
  });

  return router;
};
