const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages'); // eslint-disable-line no-unused-vars

const express = require('express');
const certifySharedPage = require('../../middlewares/certify-shared-page');
const accessTokenParser = require('../../middlewares/access-token-parser');

const ErrorV3 = require('../../models/vo/error-apiv3');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Revisions
 */
module.exports = (crowi) => {
  const loginRequired = require('../../middlewares/login-required')(crowi, true);

  const Page = crowi.model('Page');
  const Revision = crowi.model('Revision');

  /**
   * @swagger
   *
   *    /revisions/:
   *      get:
   *        tags: [Revisions]
   *        description: Get revisions by page id
   *        responses:
   *          200:
   *            description: Return revisions belong to page
   *
   */
  router.get('/list', certifySharedPage, accessTokenParser, loginRequired, async(req, res) => {
    const { pageId } = req.query;
    const { isSharedPage } = req;

    // check whether accessible
    if (!isSharedPage && !(await Page.isAccessiblePageByViewer(pageId, req.user))) {
      return res.apiv3Err(new ErrorV3('Current user is not accessible to this page.', 'forbidden-page'), 403);
    }

    try {
      const page = await Page.findOne({ _id: pageId });
      const revisions = await Revision.findRevisionIdList(page.path);
      return res.apiv3({ revisions });
    }
    catch (err) {
      const msg = 'Error occurred in getting revisions by poge id';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'faild-to-find-revisions'), 403);
    }

  });

  return router;
};
