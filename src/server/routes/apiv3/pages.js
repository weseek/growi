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
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const pathUtils = require('growi-commons').pathUtils;
  const ApiResponse = require('../../util/apiResponse');

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

  /**
   * @swagger
   *
   *    /pages.duplicate:
   *      post:
   *        tags: [Pages]
   *        operationId: duplicatePage
   *        summary: /pages/duplicate
   *        description: Duplicate page
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  page_id:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                  new_path:
   *                    $ref: '#/components/schemas/Page/properties/path'
   *                required:
   *                  - page_id
   *        responses:
   *          200:
   *            description: Succeeded to duplicate page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    page:
   *                      $ref: '#/components/schemas/Page'
   *                    tags:
   *                      $ref: '#/components/schemas/Tags'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /pages/duplicate Duplicate page
   * @apiName DuplicatePage
   * @apiGroup Page
   *
   * @apiParam {String}  Page Id.
   * @apiParam {String}  New path name.
   */
  router.post('/duplicate', async(req, res) => {
    const { pageId, pageNameInput } = req.body;
    let newPagePath = pathUtils.normalizePath(pageNameInput);

    const page = await Page.findByIdAndViewer(pageId, req.user);

    if (page == null) {
      return res.json(ApiResponse.error(`Page '${pageId}' is not found or forbidden`, 'notfound_or_forbidden'));
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

    // return api.create(req, res);
    // 以下はダミーです
    return res.apiv3({});
  });

  router.get('/duplicate', loginRequired, async(req, res) => {
    const { path, pageId } = req.query;
    const searchWord = new RegExp(`^${path}`);
    const duplicateData = await Page.find({ path: searchWord });
    const duplicatePaths = duplicateData.map(element => element.path);
    console.log(duplicatePaths);
    console.log(pageId);
    return res.apiv3({ duplicatePaths });
  });

  return router;
};
