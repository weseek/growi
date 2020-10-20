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
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);


  const Page = crowi.model('Page');

  const validator = {};

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

  validator.displayList = [
    query('limit').if(value => value != null).isInt({ max: 100 }).withMessage('You should set less than 100 or not to set limit.'),
  ];

  router.get('/list', accessTokenParser, loginRequired, validator.displayList, apiV3FormValidator, async(req, res) => {
    const { isTrashPage } = require('@commons/util/path-utils');

    const { path } = req.query;
    const limit = parseInt(req.query.limit) || await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationS') || 10;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;

    let includeTrashed = false;

    if (isTrashPage(path)) {
      includeTrashed = true;
    }

    const queryOptions = {
      offset,
      limit,
      includeTrashed,
    };

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
