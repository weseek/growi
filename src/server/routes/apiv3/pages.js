const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages'); // eslint-disable-line no-unused-vars

const express = require('express');


const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Pages
 */
module.exports = (crowi) => {
  const loginRequired = require('../../middleware/login-required')(crowi, true);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const Page = crowi.model('Page');

  /**
   * @swagger
   *
   *    /pages/recent:
   *      get:
   *        tags: [Pages]
   *        description: Get recently updated pages
   *        responses:
   *          200:
   *            description: Return pages recently updated
   *
   */
  router.get('/recent', loginRequired, async(req, res) => {
    const limit = 20;
    const offset = parseInt(req.query.offset) || 0;

    const queryOptions = {
      offset,
      limit,
      includeTrashed: false,
      isRegExpEscapedFromPath: true,
      sort: 'updatedAt',
      desc: -1,
    };

    try {
      const result = await Page.findListWithDescendants('/', req.user, queryOptions);
      if (result.pages.length > limit) {
        result.pages.pop();
      }

      return res.apiv3(result);
    }
    catch (err) {
      res.code = 'unknown';
      logger.error('Failed to get recent pages', err);
      return res.apiv3Err(err, 500);
    }
  });

  /**
  * @swagger
  *
  *    /pages/empty-trash:
  *      delete:
  *        tags: [Pages]
  *        description: empty trash
  *        responses:
  *          200:
  *            description: Succeeded to remove all trash pages
  */
  router.delete('/empty-trash', loginRequired, adminRequired, csrf, async(req, res) => {
    try {
      const pages = await Page.deleteMany({
        path: { $in: /^\/trash/ },
      });
      return res.apiv3({ pages });
    }
    catch (err) {
      res.code = 'unknown';
      logger.error('Failed to delete trash pages', err);
      return res.apiv3Err(err, 500);
    }
  });

  /**
  * @swagger
  *
  *    /pages/export:
  *      get:
  *        tags: [Export]
  *        description: create and return currently page file as md or pdf
  *        responses:
  *          200:
  *            description: Return currently page file path
  */
  router.get('/export', async(req, res) => {
    const { exportService } = crowi;

    try {
      const {
        revisionId, type, pageId,
      } = req.query;
      const exportFileName = `${pageId}`;
      const markdown = await Page.getMarkdown(revisionId);

      await exportService.cretaeMarkdownFile(markdown, exportFileName);

      if (type === 'pdf') {
        // TODO: convert markdown to pdf (GW-2757)
      }

      return res.apiv3({ exportFileName: `${exportFileName}.${type}` });
    }
    catch (err) {
      res.code = 'unknown';
      logger.error('Failed to get markdown', err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;
};
