const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:attachments'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: Attachment
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const Page = crowi.model('Page');
  const Attachment = crowi.model('Attachment');

  /**
   * @swagger
   *
   *    /attachments/list:
   *      get:
   *        tags: [Attachment]
   *        description: Get attachment list
   *        responses:
   *          200:
   *            description: Return attachment list
   *        parameters:
   *          - name: page_id
   *            in: query
   *            required: true
   *            description: page id
   *            schema:
   *              type: string
   */
  router.get('/list', accessTokenParser, loginRequired, async(req, res) => {
    const limit = +req.query.limit || 30;
    const offset = +req.query.offset || 0;
    const queryOptions = { offset, limit };

    try {
      const pageId = req.query.pageId;

      // check whether accessible
      const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user);
      if (!isAccessible) {
        const msg = 'Current user is not accessible to this page.';
        return res.apiv3Err(new ErrorV3(msg, 'attachment-list-failed'), 403);
      }

      const attachments = await Attachment.find({ page: pageId });
      const pagination = await Page.paginate({}, { queryOptions });

      console.log(pagination);

      return res.apiv3({ attachments });

    }
    catch (err) {
      logger.error('Attachment not found', err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;
};
