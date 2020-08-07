const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:attachment'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const ApiResponse = require('../../util/apiResponse');

// TODO: add swagger by GW3441

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const Page = crowi.model('Page');
  const Attachment = crowi.model('Attachment');

  router.get('/list', accessTokenParser, loginRequired, async(req, res) => {

    try {
      const pageId = req.query.page;
      // check whether accessible
      const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user);

      if (!isAccessible) {
        return res.json(ApiResponse.error('Current user is not accessible to this page.'));
      }
      const attachments = await Attachment.find({ page: pageId });
      return res.apiv3({ attachments });
    }
    catch (err) {
      logger.error('Attachment not found', err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;
};
