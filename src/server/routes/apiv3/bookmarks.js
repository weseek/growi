const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:bookmarks'); // eslint-disable-line no-unused-vars

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
  const apiV3FormValidator = require('../../middleware/apiv3-form-validator')(crowi);

  const { Page, Bookmark } = crowi.models;

  const validator = {
    bookmarks: [
      body('pageId').isString(),
      body('bool').isBoolean(),
    ],
  };

  /**
   * @swagger
   *
   *    /bookmarks:
   *      get:
   *        tags: [Bookmarks]
   *        summary: /bookmarks
   *        description: Get bookmarked status
   *        operationId: getBookmarkedStatus
   *        parameters:
   *          - name: pageId
   *            in: query
   *            description: page id
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Succeeded to get bookmarked status.
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/Bookmark'
   */
  router.get('/', accessTokenParser, loginRequired, async(req, res) => {
    const { pageId } = req.query;

    try {
      const bookmark = await Bookmark.findByPageIdAndUserId(pageId, req.user);
      return res.apiv3({ bookmark });
    }
    catch (err) {
      logger.error('get-bookmark-failed', err);
      return res.apiv3Err(err, 500);
    }
  });


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
  router.put('/', accessTokenParser, loginRequired, csrf, validator.bookmarks, apiV3FormValidator, async(req, res) => {
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
