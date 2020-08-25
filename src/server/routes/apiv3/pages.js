const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages'); // eslint-disable-line no-unused-vars

const express = require('express');
const pathUtils = require('growi-commons').pathUtils;
const escapeStringRegexp = require('escape-string-regexp');

const { body } = require('express-validator/check');
const ErrorV3 = require('../../models/vo/error-apiv3');

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
  const PageTagRelation = crowi.model('PageTagRelation');
  const GlobalNotificationSetting = crowi.model('GlobalNotificationSetting');

  const globalNotificationService = crowi.getGlobalNotificationService();
  const userNotificationService = crowi.getUserNotificationService();

  const { pageService } = crowi;

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

    duplicatePage: [
      body('pageId').isMongoId().withMessage('pageId is required'),
      body('pageNameInput').trim().isLength({ min: 1 }).withMessage('pageNameInput is required'),
      body('isRecursively').if(value => value != null).isBoolean().withMessage('isRecursively must be boolean'),
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

    const result = { page: pageService.serializeToObj(createdPage), tags: savedTags };

    // update scopes for descendants
    if (overwriteScopesOfDescendants) {
      Page.applyScopesToDescendantsAsyncronously(createdPage, req.user);
    }

    // global notification
    if (globalNotificationService != null) {
      try {
        await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_CREATE, createdPage, req.user);
      }
      catch (err) {
        logger.error('Create grobal notification failed', err);
      }
    }

    // user notification
    if (isSlackEnabled && userNotificationService != null) {
      try {
        const results = await userNotificationService.fire(createdPage, req.user, slackChannels, 'create', false);
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
  router.put('/rename', accessTokenParser, loginRequiredStrictly, csrf, validator.renamePage, apiV3FormValidator, async(req, res) => {
    const { pageId, isRecursively, revisionId } = req.body;

    let newPagePath = pathUtils.normalizePath(req.body.newPagePath);

    const options = {
      createRedirectPage: req.body.isRenameRedirect,
      updateMetadata: !req.body.isRemainMetadata,
      socketClientId: +req.body.socketClientId || undefined,
    };

    if (!Page.isCreatableName(newPagePath)) {
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

      if (isRecursively) {
        page = await Page.renameRecursively(page, newPagePath, req.user, options);
      }
      else {
        page = await Page.rename(page, newPagePath, req.user, options);
      }
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Failed to update page.', 'unknown'), 500);
    }

    const result = { page: pageService.serializeToObj(page) };

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
      return res.apiv3Err(new ErrorV3('Failed to update page.', 'unknown'), 500);
    }
  });

  async function duplicatePage(page, newPagePath, user) {
    // populate
    await page.populate({ path: 'revision', model: 'Revision', select: 'body' }).execPopulate();

    // create option
    const options = { page };
    options.grant = page.grant;
    options.grantUserGroupId = page.grantedGroup;
    options.grantedUsers = page.grantedUsers;

    const createdPage = await createPageAction({
      path: newPagePath, user, body: page.revision.body, options,
    });

    const originTags = await page.findRelatedTagsById();
    const savedTags = await saveTagsAction({ page, createdPage, pageTags: originTags });

    // global notification
    if (globalNotificationService != null) {
      try {
        await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_CREATE, createdPage, user);
      }
      catch (err) {
        logger.error('Create grobal notification failed', err);
      }
    }

    return { page: pageService.serializeToObj(createdPage), tags: savedTags };
  }

  async function duplicatePageRecursively(page, newPagePath, user) {
    const newPagePathPrefix = newPagePath;
    const pathRegExp = new RegExp(`^${escapeStringRegexp(page.path)}`, 'i');

    const pages = await Page.findManageableListWithDescendants(page, user);

    const promise = pages.map(async(page) => {
      const newPagePath = page.path.replace(pathRegExp, newPagePathPrefix);
      return duplicatePage(page, newPagePath, user);
    });

    return Promise.allSettled(promise);
  }


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

    let result;

    if (isRecursively) {
      result = await duplicatePageRecursively(page, newPagePath, req.user);
    }
    else {
      result = await duplicatePage(page, newPagePath, req.user);
    }

    return res.apiv3({ result });
  });


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
  return router;
};
