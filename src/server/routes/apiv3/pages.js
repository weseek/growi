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
  const pathUtils = require('growi-commons').pathUtils;

  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const loginRequiredStrictly = require('../middlewares/login-required')(crowi);

  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);

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
      const pages = await Page.completelyDeletePageRecursively('/trash', req.user);
      return res.apiv3({ pages });
    }
    catch (err) {
      res.code = 'unknown';
      logger.error('Failed to delete trash pages', err);
      return res.apiv3Err(err, 500);
    }
  });

  router.put('/duplicate', accessTokenParser, loginRequiredStrictly, csrf, async(req, res) => {
    const pageId = req.body.page_id;
    let newPagePath = pathUtils.normalizePath(req.body.new_path);

    const page = await Page.findByIdAndViewer(pageId, req.user);

    if (page == null) {
      res.code = 'Page is not found';
      logger.error('Failed to find the pages');
      return res.apiv3Err();
      // return res.json(ApiResponse.error(`Page '${pageId}' is not found or forbidden`, 'notfound_or_forbidden'));
    }

    // check whether path starts slash
    newPagePath = pathUtils.addHeadingSlash(newPagePath);

    await page.populateDataToShowRevision();
    const originTags = await page.findRelatedTagsById();

    req.body.path = newPagePath;
    req.body.body = page.revision.body;
    req.body.grant = page.grant;
    req.body.grantedUsers = page.grantedUsers;
    req.body.grantUserGroupId = page.grantedGroup;
    req.body.pageTags = originTags;

    return res.apiv3({});

  });


  router.get('/subordinated-list', accessTokenParser, loginRequired, async(req, res) => {
    const { path } = req.query;

    try {
      const pageData = await Page.findByPath(path);

      const result = await Page.findManageableListWithDescendants(pageData, req.user);

      const resultPaths = result.map(element => element.path);

      return res.apiv3({ resultPaths });
    }
    catch (err) {
      res.code = 'unknown';
      logger.error('Failed to find the path', err);
      return res.apiv3Err(err, 500);
    }

  });
  return router;
};
