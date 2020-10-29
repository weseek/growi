const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:bookmarks'); // eslint-disable-line no-unused-vars

const express = require('express');
const { body, query } = require('express-validator');

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
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const { Page, Bookmark, User } = crowi.models;

  const validator = {
    bookmarks: [
      body('pageId').isMongoId(),
      body('bool').isBoolean(),
    ],
    bookmarkInfo: [
      query('pageId').isMongoId(),
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
  router.get('/', accessTokenParser, loginRequired, validator.bookmarkInfo, async(req, res) => {
    const { pageId } = req.query;

    try {
      const bookmarks = await Bookmark.findByPageIdAndUserId(pageId, req.user);
      const sumOfBookmarks = await Bookmark.countByPageId(pageId);
      return res.apiv3({ bookmarks, sumOfBookmarks });
    }
    catch (err) {
      logger.error('get-bookmark-failed', err);
      return res.apiv3Err(err, 500);
    }
  });

  // select page from bookmark where userid = userid
  /**
   * @swagger
   *
   *    /bookmarks/{userId}:
   *      get:
   *        tags: [Bookmarks]
   *        summary: /bookmarks/{userId}
   *        description: Get my bookmarked status
   *        operationId: getMyBookmarkedStatus
   *        parameters:
   *          - name: userId
   *            in: path
   *            required: true
   *            description: user id
   *            schema:
   *              type: string
   *          - name: page
   *            in: query
   *            description: selected page number
   *            schema:
   *              type: number
   *          - name: limit
   *            in: query
   *            description: page item limit
   *            schema:
   *              type: number
   *          - name: offset
   *            in: query
   *            description: page item offset
   *            schema:
   *              type: number
   *        responses:
   *          200:
   *            description: Succeeded to get my bookmarked status.
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/Bookmark'
   */
  validator.myBookmarkList = [
    query('page').isInt({ min: 1 }),
    query('limit').if(value => value != null).isInt({ max: 300 }).withMessage('You should set less than 300 or not to set limit.'),
  ];

  router.get('/:userId', accessTokenParser, loginRequired, validator.myBookmarkList, apiV3FormValidator, async(req, res) => {
    const { userId } = req.params;
    const page = req.query.page;
    const limit = parseInt(req.query.limit) || await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationM') || 30;

    if (userId == null) {
      return res.apiv3Err('User id is not found or forbidden', 400);
    }
    if (limit == null) {
      return res.apiv3Err('Could not catch page limit', 400);
    }
    try {
      const paginationResult = await Bookmark.paginate(
        {
          user: { $in: userId },
        },
        {
          populate: {
            path: 'page',
            model: 'Page',
            populate: {
              path: 'lastUpdateUser',
              model: 'User',
              select: User.USER_PUBLIC_FIELDS,
            },
          },
          page,
          limit,
        },
      );
      return res.apiv3({ paginationResult });
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
  router.put('/', accessTokenParser, loginRequiredStrictly, csrf, validator.bookmarks, apiV3FormValidator, async(req, res) => {
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

  /**
   * @swagger
   *
   *    /count-bookmarks:
   *      get:
   *        tags: [Bookmarks]
   *        summary: /bookmarks
   *        description: Count bookmsrks
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/BookmarkParams'
   *        responses:
   *          200:
   *            description: Succeeded to count bookmarks.
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/Bookmark'
   */

  return router;
};
