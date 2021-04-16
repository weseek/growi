import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:pages'); // eslint-disable-line no-unused-vars
const express = require('express');
const pathUtils = require('growi-commons').pathUtils;

const { body } = require('express-validator');
const { query } = require('express-validator');
const ErrorV3 = require('../../models/vo/error-apiv3');

const { isCreatablePage } = require('~/utils/path-utils');

const router = express.Router();

const LIMIT_FOR_LIST = 10;

/**
 * @swagger
 *  tags:
 *    name: Pages
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      Page:
 *        description: Page
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
 *          commentCount:
 *            type: number
 *            description: count of comments
 *            example: 3
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 *          creator:
 *            $ref: '#/components/schemas/User'
 *          extended:
 *            type: object
 *            description: extend data
 *            example: {}
 *          grant:
 *            type: number
 *            description: grant
 *            example: 1
 *          grantedUsers:
 *            type: array
 *            description: granted users
 *            items:
 *              type: string
 *              description: user ID
 *            example: ["5ae5fccfc5577b0004dbd8ab"]
 *          lastUpdateUser:
 *            $ref: '#/components/schemas/User'
 *          liker:
 *            type: array
 *            description: granted users
 *            items:
 *              type: string
 *              description: user ID
 *            example: []
 *          path:
 *            type: string
 *            description: page path
 *            example: /
 *          redirectTo:
 *            type: string
 *            description: redirect path
 *            example: ""
 *          revision:
 *            type: string
 *            description: revision ID
 *            example: ["5ae5fccfc5577b0004dbd8ab"]
 *          seenUsers:
 *            type: array
 *            description: granted users
 *            items:
 *              type: string
 *              description: user ID
 *            example: ["5ae5fccfc5577b0004dbd8ab"]
 *          status:
 *            type: string
 *            description: status
 *            enum:
 *              - 'wip'
 *              - 'published'
 *              - 'deleted'
 *              - 'deprecated'
 *            example: published
 *          updatedAt:
 *            type: string
 *            description: date updated at
 *            example: 2010-01-01T00:00:00.000Z
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const Page = crowi.model('Page');
  const User = crowi.model('User');
  const PageTagRelation = crowi.model('PageTagRelation');
  const GlobalNotificationSetting = crowi.model('GlobalNotificationSetting');

  const globalNotificationService = crowi.getGlobalNotificationService();
  const userNotificationService = crowi.getUserNotificationService();

  const { serializePageSecurely } = require('../../models/serializers/page-serializer');
  const { serializeRevisionSecurely } = require('../../models/serializers/revision-serializer');
  const { serializeUserSecurely } = require('../../models/serializers/user-serializer');

  const validator = {
    createPage: [
      body('body').exists().not().isEmpty({ ignore_whitespace: true })
        .withMessage('body is required'),
      body('path').exists().not().isEmpty({ ignore_whitespace: true })
        .withMessage('path is required'),
      body('grant').if(value => value != null).isInt({ min: 0, max: 5 }).withMessage('grant must be integer from 1 to 5'),
      body('overwriteScopesOfDescendants').if(value => value != null).isBoolean().withMessage('overwriteScopesOfDescendants must be boolean'),
      body('isSlackEnabled').if(value => value != null).isBoolean().withMessage('isSlackEnabled must be boolean'),
      body('slackChannels').if(value => value != null).isString().withMessage('slackChannels must be string'),
      body('socketClientId').if(value => value != null).isInt().withMessage('socketClientId must be int'),
      body('pageTags').if(value => value != null).isArray().withMessage('pageTags must be array'),
    ],

    renamePage: [
      body('pageId').isMongoId().withMessage('pageId is required'),
      body('revisionId').isMongoId().withMessage('revisionId is required'),
      body('newPagePath').isLength({ min: 1 }).withMessage('newPagePath is required'),
      body('isRenameRedirect').if(value => value != null).isBoolean().withMessage('isRenameRedirect must be boolean'),
      body('isRemainMetadata').if(value => value != null).isBoolean().withMessage('isRemainMetadata must be boolean'),
      body('isRecursively').if(value => value != null).isBoolean().withMessage('isRecursively must be boolean'),
      body('socketClientId').if(value => value != null).isInt().withMessage('socketClientId must be int'),
    ],

    removePage: [
      body('pageId').isMongoId().withMessage('pageId is required'),
      body('revisionId').isMongoId().withMessage('revisionId is required'),
      body('isRecursively').if(value => value != null).isBoolean().withMessage('isRecursively must be boolean'),
      body('isCompletely').if(value => value != null).isBoolean().withMessage('isCompletely must be boolean'),
    ],

    duplicatePage: [
      body('pageId').isMongoId().withMessage('pageId is required'),
      body('pageNameInput').trim().isLength({ min: 1 }).withMessage('pageNameInput is required'),
      body('isRecursively').if(value => value != null).isBoolean().withMessage('isRecursively must be boolean'),
    ],

    descendantsCount: [
      body('path').isLength({ min: 1 }).withMessage('path is required'),
    ],
  };

  async function createPageAction({
    path, body, user, options,
  }) {
    const createdPage = Page.create(path, body, user, options);
    return createdPage;
  }

  async function saveTagsAction({ createdPage, pageTags }) {
    if (pageTags != null) {
      await PageTagRelation.updatePageTags(createdPage.id, pageTags);
      return PageTagRelation.listTagNamesByPage(createdPage.id);
    }

    return [];
  }

  /**
   * @swagger
   *
   *    /pages/create:
   *      post:
   *        tags: [Pages]
   *        operationId: createPage
   *        description: Create page
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  body:
   *                    type: string
   *                    description: Text of page
   *                  path:
   *                    $ref: '#/components/schemas/Page/properties/path'
   *                  grant:
   *                    $ref: '#/components/schemas/Page/properties/grant'
   *                required:
   *                  - body
   *                  - path
   *        responses:
   *          201:
   *            description: Succeeded to create page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    page:
   *                      $ref: '#/components/schemas/Page'
   *          409:
   *            description: page path is already existed
   */
  router.post('/', accessTokenParser, loginRequiredStrictly, csrf, validator.createPage, apiV3FormValidator, async(req, res) => {
    const {
      body, grant, grantUserGroupId, overwriteScopesOfDescendants, isSlackEnabled, slackChannels, socketClientId, pageTags,
    } = req.body;

    let { path } = req.body;

    // check whether path starts slash
    path = pathUtils.addHeadingSlash(path);

    // check page existence
    const isExist = await Page.count({ path }) > 0;
    if (isExist) {
      return res.apiv3Err(new ErrorV3('Failed to post page', 'page_exists'), 500);
    }

    const options = { socketClientId };
    if (grant != null) {
      options.grant = grant;
      options.grantUserGroupId = grantUserGroupId;
    }

    const createdPage = await createPageAction({
      path, body, user: req.user, options,
    });

    const savedTags = await saveTagsAction({ createdPage, pageTags });

    const result = {
      page: serializePageSecurely(createdPage),
      tags: savedTags,
      revision: serializeRevisionSecurely(createdPage.revision),
    };

    // update scopes for descendants
    if (overwriteScopesOfDescendants) {
      Page.applyScopesToDescendantsAsyncronously(createdPage, req.user);
    }

    try {
      // global notification
      await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_CREATE, createdPage, req.user);
    }
    catch (err) {
      logger.error('Create grobal notification failed', err);
    }

    // user notification
    if (isSlackEnabled) {
      try {
        const results = await userNotificationService.fire(createdPage, req.user, slackChannels, 'create');
        results.forEach((result) => {
          if (result.status === 'rejected') {
            logger.error('Create user notification failed', result.reason);
          }
        });
      }
      catch (err) {
        logger.error('Create user notification failed', err);
      }
    }

    return res.apiv3(result, 201);
  });


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

      result.pages.forEach((page) => {
        if (page.lastUpdateUser != null && page.lastUpdateUser instanceof User) {
          page.lastUpdateUser = serializeUserSecurely(page.lastUpdateUser);
        }
      });

      return res.apiv3(result);
    }
    catch (err) {
      logger.error('Failed to get recent pages', err);
      return res.apiv3Err(new ErrorV3('Failed to get recent pages', 'unknown'), 500);
    }
  });

  /**
   * @swagger
   *
   *
   *    /pages/rename:
   *      post:
   *        tags: [Pages]
   *        operationId: renamePage
   *        description: Rename page
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  pageId:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                  path:
   *                    $ref: '#/components/schemas/Page/properties/path'
   *                  revisionId:
   *                    type: string
   *                    description: revision ID
   *                    example: 5e07345972560e001761fa63
   *                  newPagePath:
   *                    type: string
   *                    description: new path
   *                    example: /user/alice/new_test
   *                  isRenameRedirect:
   *                    type: boolean
   *                    description: whether redirect page
   *                  isRemainMetadata:
   *                    type: boolean
   *                    description: whether remain meta data
   *                  isRecursively:
   *                    type: boolean
   *                    description: whether rename page with descendants
   *                required:
   *                  - pageId
   *                  - revisionId
   *        responses:
   *          200:
   *            description: Succeeded to rename page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    page:
   *                      $ref: '#/components/schemas/Page'
   *          401:
   *            description: page id is invalid
   *          409:
   *            description: page path is already existed
   */
  router.put('/rename', accessTokenParser, loginRequiredStrictly, validator.renamePage, apiV3FormValidator, async(req, res) => {
    const { pageId, isRecursively, revisionId } = req.body;

    let newPagePath = pathUtils.normalizePath(req.body.newPagePath);

    const options = {
      createRedirectPage: req.body.isRenameRedirect,
      updateMetadata: !req.body.isRemainMetadata,
      socketClientId: +req.body.socketClientId || undefined,
    };

    if (!isCreatablePage(newPagePath)) {
      return res.apiv3Err(new ErrorV3(`Could not use the path '${newPagePath})'`, 'invalid_path'), 409);
    }

    // check whether path starts slash
    newPagePath = pathUtils.addHeadingSlash(newPagePath);

    const isExist = await Page.count({ path: newPagePath }) > 0;
    if (isExist) {
      // if page found, cannot cannot rename to that path
      return res.apiv3Err(new ErrorV3(`${newPagePath} already exists`, 'already_exists'), 409);
    }

    let page;

    try {
      page = await Page.findByIdAndViewer(pageId, req.user);

      if (page == null) {
        return res.apiv3Err(new ErrorV3(`Page '${pageId}' is not found or forbidden`, 'notfound_or_forbidden'), 401);
      }

      if (!page.isUpdatable(revisionId)) {
        return res.apiv3Err(new ErrorV3('Someone could update this page, so couldn\'t delete.', 'notfound_or_forbidden'), 409);
      }
      page = await crowi.pageService.renamePage(page, newPagePath, req.user, options, isRecursively);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Failed to update page.', 'unknown'), 500);
    }

    const result = { page: serializePageSecurely(page) };

    try {
      // global notification
      await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_MOVE, page, req.user, {
        oldPath: req.body.path,
      });
    }
    catch (err) {
      logger.error('Move notification failed', err);
    }

    return res.apiv3(result);
  });

  /**
   * @swagger
   *
   *    /pages/remove:
   *      post:
   *        tags: [Pages]
   *        operationId: removePage
   *        description: Remove page
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  pageId:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                  revisionId:
   *                    type: string
   *                    description: revision ID
   *                    example: 5e07345972560e001761fa63
   *                  isRecursively:
   *                    type: boolean
   *                    description: whether remove page with descendants
   *                  isCompletely:
   *                    type: boolean
   *                    description: whether delete page completely
   *                required:
   *                  - pageId
   *                  - revisionId
   *        responses:
   *          200:
   *            description: Succeeded to remove page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    page:
   *                      $ref: '#/components/schemas/Page'
   *          401:
   *            description: page id is invalid
   *          409:
   *            description: page has already been updated by someone else
   */
  router.put('/remove', accessTokenParser, loginRequiredStrictly, validator.removePage, apiV3FormValidator, async(req, res) => {
    const {
      pageId, revisionId, isRecursively, isCompletely,
    } = req.body;
    const options = { socketClientId: req.body.socketClientId || undefined };
    const page = await Page.findByIdAndViewer(pageId, req.user);

    if (page == null) {
      return res.apiv3Err(new ErrorV3(`Page '${pageId}' is not found or forbidden`, 'notfound_or_forbidden'));
    }

    logger.debug('Delete page', page._id, page.path);

    try {
      if (isCompletely) {
        if (!req.user.canDeleteCompletely(page.creator)) {
          return res.apiv3Err(new ErrorV3('You can not delete completel.', 'user_not_admin'), 403);
        }
        await crowi.pageService.deleteCompletely(page, req.user, options, isRecursively);
      }
      else {
        if (!page.isUpdatable(revisionId)) {
          return res.apiv3Err(new ErrorV3('Someone could update this page, so couldn\'t delete.', 'outdated'), 409);
        }

        await crowi.pageService.deletePage(page, req.user, options, isRecursively);
      }
    }
    catch (err) {
      logger.error('Error occured while get setting', err);
      return res.apiv3Err(new ErrorV3('Failed to delete page.', 'unknown'), 500);
    }

    logger.debug('Page deleted', page.path);

    const result = { page: serializePageSecurely(page) };

    try {
      // global notification
      await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_DELETE, page, req.user);
    }
    catch (err) {
      logger.error('Delete notification failed', err);
    }

    return res.apiv3(result);
  });

  validator.emptyTrash = [
    query('socketClientId').if(value => value != null).isInt().withMessage('socketClientId must be int'),
  ];
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
  router.delete('/empty-trash', accessTokenParser, loginRequired, adminRequired, csrf, validator.emptyTrash, apiV3FormValidator, async(req, res) => {
    const socketClientId = parseInt(req.query.socketClientId);
    const options = { socketClientId };

    try {
      const pages = await crowi.pageService.deleteCompletelyDescendantsWithStream({ path: '/trash' }, req.user, options);
      return res.apiv3({ pages });
    }
    catch (err) {
      return res.apiv3Err(new ErrorV3('Failed to update page.', 'unknown'), 500);
    }
  });

  validator.displayList = [
    query('limit').if(value => value != null).isInt({ max: 100 }).withMessage('You should set less than 100 or not to set limit.'),
  ];

  router.get('/list', accessTokenParser, loginRequired, validator.displayList, apiV3FormValidator, async(req, res) => {
    const { isTrashPage, isCreatablePage } = require('~/utils/path-utils');

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

      result.pages.forEach((page) => {
        if (page.lastUpdateUser != null && page.lastUpdateUser instanceof User) {
          page.lastUpdateUser = serializeUserSecurely(page.lastUpdateUser);
        }
      });

      return res.apiv3(result);
    }
    catch (err) {
      logger.error('Failed to get Descendants Pages', err);
      return res.apiv3Err(err, 500);
    }
  });

  /**
   * @swagger
   *
   *
   *    /pages/duplicate:
   *      post:
   *        tags: [Pages]
   *        operationId: duplicatePage
   *        description: Duplicate page
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  pageId:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                  pageNameInput:
   *                    $ref: '#/components/schemas/Page/properties/path'
   *                  isRecursively:
   *                    type: boolean
   *                    description: whether duplicate page with descendants
   *                required:
   *                  - pageId
   *        responses:
   *          200:
   *            description: Succeeded to duplicate page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    page:
   *                      $ref: '#/components/schemas/Page'
   *
   *          403:
   *            description: Forbidden to duplicate page.
   *          500:
   *            description: Internal server error.
   */
  router.post('/duplicate', accessTokenParser, loginRequiredStrictly, csrf, validator.duplicatePage, apiV3FormValidator, async(req, res) => {
    const { pageId, isRecursively } = req.body;

    const newPagePath = pathUtils.normalizePath(req.body.pageNameInput);

    // check page existence
    const isExist = (await Page.count({ path: newPagePath })) > 0;
    if (isExist) {
      return res.apiv3Err(new ErrorV3(`Page exists '${newPagePath})'`, 'already_exists'), 409);
    }

    const page = await Page.findByIdAndViewer(pageId, req.user);

    // null check
    if (page == null) {
      res.code = 'Page is not found';
      logger.error('Failed to find the pages');
      return res.apiv3Err(new ErrorV3('Not Founded the page', 'notfound_or_forbidden'), 404);
    }

    const newParentPage = await crowi.pageService.duplicate(page, newPagePath, req.user, isRecursively);
    const result = { page: serializePageSecurely(newParentPage) };

    page.path = newPagePath;
    try {
      await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_CREATE, page, req.user);
    }
    catch (err) {
      logger.error('Create grobal notification failed', err);
    }

    return res.apiv3(result);
  });

  /**
   * @swagger
   *
   *
   *    /pages/subordinated-list:
   *      get:
   *        tags: [Pages]
   *        operationId: subordinatedList
   *        description: Get subordinated pages
   *        parameters:
   *          - name: path
   *            in: query
   *            description: Parent path of search
   *            schema:
   *              type: string
   *          - name: limit
   *            in: query
   *            description: Limit of acquisitions
   *            schema:
   *              type: number
   *        responses:
   *          200:
   *            description: Succeeded to retrieve pages.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    subordinatedPaths:
   *                      type: object
   *                      description: descendants page
   *          500:
   *            description: Internal server error.
   */
  router.get('/subordinated-list', accessTokenParser, loginRequired, async(req, res) => {
    const { path } = req.query;
    const limit = parseInt(req.query.limit) || LIMIT_FOR_LIST;

    try {
      const pageData = await Page.findByPath(path);
      const result = await Page.findManageableListWithDescendants(pageData, req.user, { limit });

      return res.apiv3({ subordinatedPaths: result });
    }
    catch (err) {
      return res.apiv3Err(new ErrorV3('Failed to update page.', 'unknown'), 500);
    }

  });

  /**
   * @swagger
   *
   *
   *    /pages/descendants-count:
   *      get:
   *        tags: [Pages]
   *        operationId: descendantsCount
   *        description: Get descendants pages count
   *        parameters:
   *          - name: path
   *            in: query
   *            description: Parent path of search
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Succeeded to retrieve pages count.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    descendantsCount:
   *                      type: integer
   *                      description: descendants pages count
   *          500:
   *            description: Internal server error.
   */
  router.get('/descendants-count', accessTokenParser, loginRequired, validator.descendantsCount, async(req, res) => {
    const { path } = req.query;

    try {
      const descendantsCount = await Page.countManageableListWithDescendants(path, req.user);
      return res.apiv3({ descendantsCount });
    }
    catch (err) {
      return res.apiv3Err(new ErrorV3('Failed to get descendants pages count.', err), 500);
    }

  });

  return router;
};
