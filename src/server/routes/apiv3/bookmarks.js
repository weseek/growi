const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:bookmark'); // eslint-disable-line no-unused-vars

const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Bookmarks
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      Bookmark:
 *        description: Bookmark
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: page ID
 *            example: 5e07345972560e001761fa63
 *          __v:
 *            type: number
 *            description: DB record version
 *            example: 0
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 *          page:
 *            $ref: '#/components/schemas/Page/properties/_id'
 *          user:
 *            $ref: '#/components/schemas/User/properties/_id'
 *
 *      BookmarkParams:
 *        description: BookmarkParams
 *        type: object
 *        properties:
 *          pageId:
 *            type: string
 *            description: page ID
 *            example: 5e07345972560e001761fa63
 *          bool:
 *            type: boolean
 *            description: boolean for bookmark status
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middleware/access-token-parser')(crowi);
  const loginRequired = require('../../middleware/login-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { Page, Bookmark } = crowi.models;
  const { ApiV3FormValidator } = crowi.middlewares;

  const validator = {
    bookmarks: [
      body('pageId').isString(),
      body('bool').isBoolean(),
    ],
  };
  /**
   * @swagger
   *
   *    /bookmarks.get:
   *      get:
   *        tags: [Bookmarks, CrowiCompatibles]
   *        operationId: getBookmark
   *        summary: /bookmarks.get
   *        description: Get bookmark of the page with the user
   *        parameters:
   *          - in: query
   *            name: page_id
   *            required: true
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *        responses:
   *          200:
   *            description: Succeeded to get bookmark of the page with the user.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    bookmark:
   *                      $ref: '#/components/schemas/Bookmark'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  // actions.api.get = function(req, res) {
  //   const pageId = req.query.page_id;

  //   Bookmark.findByPageIdAndUserId(pageId, req.user)
  //     .then((data) => {
  //       debug('bookmark found', pageId, data);
  //       const result = {};

  //       result.bookmark = data;
  //       return res.json(ApiResponse.success(result));
  //     })
  //     .catch((err) => {
  //       return res.json(ApiResponse.error(err));
  //     });
  // };

  // actions.api.list = function(req, res) {
  //   const paginateOptions = ApiPaginate.parseOptions(req.query);

  //   const options = Object.assign(paginateOptions, { populatePage: true });
  //   Bookmark.findByUserId(req.user._id, options)
  //     .then((result) => {
  //       return res.json(ApiResponse.success(result));
  //     })
  //     .catch((err) => {
  //       return res.json(ApiResponse.error(err));
  //     });
  // };

  /**
   * @swagger
   *
   *    /bookmarks:
   *      put:
   *        tags: [Bookmarks]
   *        summary: /bookmarks
   *        description: Update bookmarked status
   *        operationId: updateBookmarkedStatus
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/BookmarkParams'
   *        responses:
   *          200:
   *            description: Succeeded to update bookmarked status.
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/Bookmark'
   */
  router.put('/', accessTokenParser, loginRequired, csrf, validator.bookmarks, ApiV3FormValidator, async(req, res) => {
    const { pageId, bool } = req.body;

    let bookmark;
    try {
      const page = await Page.findByIdAndViewer(pageId, req.user);
      if (page == null) {
        return res.apiv3Err(`Page '${pageId}' is not found or forbidden`);
      }
      if (bool) {
        bookmark = await Bookmark.add(page, req.user);
      }
      else {
        bookmark = await Bookmark.removeBookmark(page, req.user);
      }
    }
    catch (err) {
      logger.error('update-bookmark-failed', err);
      return res.apiv3Err(err, 500);
    }

    bookmark.depopulate('page');
    bookmark.depopulate('user');

    return res.apiv3({ bookmark });
  });

  return router;
};
