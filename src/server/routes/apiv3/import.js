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
   * defined overwrite params for each collection
   * all imported documents are overwriten by this value
   * each value can be any value or a function (_value, { _document, key, schema }) { return newValue }
   *
   * @param {object} Model instance of mongoose model
   * @param {object} req request object
   * @return {object} document to be persisted
   */
  const overwriteParamsFn = async(Model, req) => {
    const { collectionName } = Model.collection;

    /* eslint-disable no-case-declarations */
    switch (Model.collection.collectionName) {
      case 'pages':
        // TODO: use req.body to generate overwriteParams
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
   *  /import/:collection:
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
        overwriteParams = await overwriteParamsFn(Model, req);
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
