const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:import'); // eslint-disable-line no-unused-vars
const path = require('path');
const multer = require('multer');
const autoReap = require('multer-autoreap');

const express = require('express');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Import
 */

module.exports = (crowi) => {
  const { importService } = crowi;
  const { Page } = crowi.models;
  const uploads = multer({
    dest: importService.baseDir,
    fileFilter: (req, file, cb) => {
      if (path.extname(file.originalname) === '.zip') {
        return cb(null, true);
      }
      cb(new Error('Only .zip is allowed'));
    },
  });

  /**
   * @swagger
   *
   *  /export/pages:
   *    post:
   *      tags: [Import]
   *      description: import a collection from a zipped json for page collection
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: data is successfully imported
   *          content:
   *            application/json:
   */
  router.post('/pages', uploads.single('file'), autoReap, async(req, res) => {
    // TODO: rename path to "/:collection" and add express validator
    const { file } = req;
    const zipFilePath = path.join(file.destination, file.filename);

    try {
      let overwriteOption;
      const overwriteOptionFn = importService.getOverwriteOption(Page);
      // await in case overwriteOption is a Promise
      if (overwriteOptionFn != null) {
        overwriteOption = await overwriteOptionFn(req);
      }

      await importService.importFromZip(Page, zipFilePath, overwriteOption);

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
