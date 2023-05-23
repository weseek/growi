import { SupportedAction, SupportedTargetModel } from '~/interfaces/activity';
import { generateAddActivityMiddleware } from '~/server/middlewares/add-activity';
import { serializePageSecurely } from '~/server/models/serializers/page-serializer';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';
import BookmarkFolder from '../../models/bookmark-folder';

const logger = loggerFactory('growi:routes:apiv3:bookmarks'); // eslint-disable-line no-unused-vars

const express = require('express');
const { body, query, param } = require('express-validator');

const { serializeUserSecurely } = require('../../models/serializers/user-serializer');

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
 *
 *      BookmarkInfo:
 *        description: BookmarkInfo
 *        type: object
 *        properties:
 *          sumOfBookmarks:
 *            type: number
 *            description: how many people bookmarked the page
 *          isBookmarked:
 *            type: boolean
 *            description: Whether the request user bookmarked (will be returned if the user is included in the request)
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const addActivity = generateAddActivityMiddleware(crowi);

  const activityEvent = crowi.event('activity');

  const { Page, Bookmark, User } = crowi.models;

  const validator = {
    bookmarks: [
      body('pageId').isString(),
      body('bool').isBoolean(),
    ],
    bookmarkInfo: [
      query('pageId').isMongoId(),
    ],
  };

  /**
   * @swagger
   *
   *    /bookmarks/info:
   *      get:
   *        tags: [Bookmarks]
   *        summary: /bookmarks/info
   *        description: Get bookmarked info
   *        operationId: getBookmarkedInfo
   *        parameters:
   *          - name: pageId
   *            in: query
   *            description: page id
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Succeeded to get bookmark info.
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/BookmarkInfo'
   */
  router.get('/info', accessTokenParser, loginRequired, validator.bookmarkInfo, apiV3FormValidator, async(req, res) => {
    const { user } = req;
    const { pageId } = req.query;

    const responsesParams = {};

    try {
      const bookmarks = await Bookmark.find({ page: pageId }).populate('user');
      let users = [];
      if (bookmarks.length > 0) {
        users = bookmarks.map(bookmark => serializeUserSecurely(bookmark.user));
      }
      responsesParams.sumOfBookmarks = bookmarks.length;
      responsesParams.bookmarkedUsers = users;
    }
    catch (err) {
      logger.error('get-bookmark-document-failed', err);
      return res.apiv3Err(err, 500);
    }

    // guest user only get bookmark count
    if (user == null) {
      return res.apiv3(responsesParams);
    }

    try {
      const bookmark = await Bookmark.findByPageIdAndUserId(pageId, user._id);
      responsesParams.isBookmarked = (bookmark != null);
      return res.apiv3(responsesParams);
    }
    catch (err) {
      logger.error('get-bookmark-state-failed', err);
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
  validator.userBookmarkList = [
    param('userId').isMongoId().withMessage('userId is required'),
  ];

  router.get('/:userId', accessTokenParser, loginRequired, validator.userBookmarkList, apiV3FormValidator, async(req, res) => {
    const { userId } = req.params;

    if (userId == null) {
      return res.apiv3Err('User id is not found or forbidden', 400);
    }
    try {
      const bookmarkIdsInFolders = await BookmarkFolder.distinct('bookmarks', { owner: userId });
      const userRootBookmarks = await Bookmark.find({
        _id: { $nin: bookmarkIdsInFolders },
        user: userId,
      }).populate({
        path: 'page',
        model: 'Page',
        populate: {
          path: 'lastUpdateUser',
          model: 'User',
        },
      });

      // serialize page
      userRootBookmarks.map((bookmark) => {
        if (bookmark.page != null && bookmark.page instanceof Page) {
          return {
            ...bookmark,
            page: serializePageSecurely(bookmark.page),
          };
        }
        return bookmark;
      });

      return res.apiv3({ userRootBookmarks });
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
  router.put('/', accessTokenParser, loginRequiredStrictly, addActivity, validator.bookmarks, apiV3FormValidator, async(req, res) => {
    const { pageId, bool } = req.body;
    const userId = req.user?._id;

    if (userId == null) {
      return res.apiv3Err('A logged in user is required.');
    }

    let page;
    let bookmark;
    try {
      page = await Page.findByIdAndViewer(pageId, req.user);
      if (page == null) {
        return res.apiv3Err(`Page '${pageId}' is not found or forbidden`);
      }

      bookmark = await Bookmark.findByPageIdAndUserId(page._id, req.user._id);

      if (bookmark == null) {
        if (bool) {
          bookmark = await Bookmark.add(page, req.user);
        }
        else {
          logger.warn(`Removing the bookmark for ${page._id} by ${req.user._id} failed because the bookmark does not exist.`);
        }
      }
      else {
        // eslint-disable-next-line no-lonely-if
        if (bool) {
          logger.warn(`Adding the bookmark for ${page._id} by ${req.user._id} failed because the bookmark has already exist.`);
        }
        else {
          bookmark = await Bookmark.removeBookmark(page, req.user);
        }
      }
    }
    catch (err) {
      logger.error('update-bookmark-failed', err);
      return res.apiv3Err(err, 500);
    }

    if (bookmark != null) {
      bookmark.depopulate('page');
      bookmark.depopulate('user');
    }

    const parameters = {
      targetModel: SupportedTargetModel.MODEL_PAGE,
      target: page,
      action: bool ? SupportedAction.ACTION_PAGE_BOOKMARK : SupportedAction.ACTION_PAGE_UNBOOKMARK,
    };
    activityEvent.emit('update', res.locals.activity._id, parameters, page);

    return res.apiv3({ bookmark });
  });

  return router;
};
