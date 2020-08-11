const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages');

const express = require('express');

const ErrorV3 = require('../../models/vo/error-apiv3');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Revisions
 */
module.exports = (crowi) => {
  const certifySharedPage = require('../../middlewares/certify-shared-file')(crowi);
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);

  const {
    Revision,
    Page,
  } = crowi.models;

  /**
   * @swagger
   *
   *    /revisions/list:
   *      get:
   *        tags: [Revisions]
   *        description: Get revisions by page id
   *        parameters:
   *          - in: query
   *            name: pageId
   *            schema:
   *              type: string
   *              description:  page id
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
      return res.apiv3Err(new ErrorV3(msg, 'faild-to-find-revisions'), 500);
    }

  });

  return router;
};
