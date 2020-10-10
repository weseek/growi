const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const { query } = require('express-validator');


/**
 * @swagger
 *  tags:
 *    name: Pages
 */
module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);

  const Page = crowi.model('Page');

  const validator = {
    displayList: [
      query('pageLimitationS').custom((value) => {
        if (value === undefined) {
          return 10;
        }
        if (value > 100) {
          throw new Error('You should set less than 100 or not to set pageLimitationS.');
        }
        return value;
      }),
    ],
  };

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
      const pages = await Page.completelyDeletePageRecursively('/trash', req.user);
      return res.apiv3({ pages });
    }
    catch (err) {
      res.code = 'unknown';
      logger.error('Failed to delete trash pages', err);
      return res.apiv3Err(err, 500);
    }
  });

  router.get('/list', accessTokenParser, loginRequired, validator.displayList, async(req, res) => {
    const pageLimitationS = req.query.pageLimitationS || await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationS') || 10;
    const { path } = req.query;
    const selectedPage = req.query.activePage;
    const offset = (selectedPage - 1) * pageLimitationS;

    const queryOptions = { offset, limit: pageLimitationS };

    try {
      const result = await Page.findListWithDescendants(path, req.user, queryOptions);
      return res.apiv3(result);
    }
    catch (err) {
      logger.error('Failed to get Descendants Pages', err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;
};
