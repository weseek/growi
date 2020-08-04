const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages'); // eslint-disable-line no-unused-vars

const express = require('express');
const pathUtils = require('growi-commons').pathUtils;


const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Pages
 */
module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);

  const Page = crowi.model('Page');
  const PageTagRelation = crowi.model('PageTagRelation');
  const GlobalNotificationSetting = crowi.model('GlobalNotificationSetting');

  const globalNotificationService = crowi.getGlobalNotificationService();
  const userNotificationService = crowi.getUserNotificationService();
  const { pageService } = crowi;

  // TODO write swagger(GW-3384) and validation(GW-3385)
  router.post('/', accessTokenParser, loginRequiredStrictly, csrf, async(req, res) => {
    const {
      body, grant, grantUserGroupId, overwriteScopesOfDescendants, isSlackEnabled, slackChannels, socketClientId, pageTags,
    } = req.body;
    let { path } = req.body;

    // check whether path starts slash
    path = pathUtils.addHeadingSlash(path);

    // check page existence
    const isExist = await Page.count({ path }) > 0;
    if (isExist) {
      res.code = 'page_exists';
      return res.apiv3Err('Page exists', 409);
    }

    const options = { socketClientId };
    if (grant != null) {
      options.grant = grant;
      options.grantUserGroupId = grantUserGroupId;
    }

    const createdPage = await Page.create(path, body, req.user, options);

    let savedTags;
    if (pageTags != null) {
      await PageTagRelation.updatePageTags(createdPage.id, pageTags);
      savedTags = await PageTagRelation.listTagNamesByPage(createdPage.id);
    }

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

    return res.apiv3(result);
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
      res.code = 'unknown';
      logger.error('Failed to get recent pages', err);
      return res.apiv3Err(err, 500);
    }
  });

  // TODO swagger and validation
  router.put('/rename', accessTokenParser, loginRequiredStrictly, csrf, async(req, res) => {
    const { pageId, isRecursively, revisionId } = req.body;

    let newPagePath = pathUtils.normalizePath(req.body.newPagePath);

    const options = {
      createRedirectPage: req.body.isRenameRedirect,
      updateMetadata: req.body.isRemainMetadata,
      socketClientId: +req.body.socketClientId || undefined,
    };

    if (!Page.isCreatableName(newPagePath)) {
      res.code = 'invalid_path';
      return res.apiv3Err(`Could not use the path '${newPagePath})'`, 409);
    }

    // check whether path starts slash
    newPagePath = pathUtils.addHeadingSlash(newPagePath);

    const isExist = await Page.count({ path: newPagePath }) > 0;
    if (isExist) {
      // if page found, cannot cannot rename to that path
      res.code = 'already_exists';
      return res.apiv3Err(`'new_path=${newPagePath}' already exists`, 409);
    }

    let page;

    try {
      page = await Page.findByIdAndViewer(pageId, req.user);

      if (page == null) {
        res.code = 'notfound_or_forbidden';
        return res.apiv3Err(`Page '${pageId}' is not found or forbidden`, 401);
      }

      if (!page.isUpdatable(revisionId)) {
        res.code = 'notfound_or_forbidden';
        return res.apiv3Err('Someone could update this page, so couldn\'t delete.', 409);
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
      res.code = 'unknown';
      return res.apiv3Err('Failed to update page.', 500);
    }

    // result.page = page; // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

    try {
      // global notification
      await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_MOVE, page, req.user, {
        oldPath: req.body.path,
      });
    }
    catch (err) {
      logger.error('Move notification failed', err);
    }

    return res.apiv3({ page });
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
