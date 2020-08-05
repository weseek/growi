const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:attachment'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

/**
 * @swagger
 *
 *     /attachment:
 *      get:
 *        tags: [Attachment]
 *
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  // const loginRequired = require('../../middlewares/login-required')(crowi);
  const Attachment = crowi.model('Attachment');

  // router.get('/attachment', accessTokenParser, loginRequired, async(req, res) => {
  router.get('/list', accessTokenParser, async(req, res) => {
    const id = req.query.id;
    // const ids = console.log(req.query.id);

    try {
      const attachment = await Attachment.findById(id);
      return res.apiv3({ attachment });
    }
    catch (err) {
      logger.error('attachment not found', err);
      return res.apiv3Err(err, 404);
    }
  });

  return router;
};
