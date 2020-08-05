const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages'); // eslint-disable-line no-unused-vars

const express = require('express');
const pathUtils = require('growi-commons').pathUtils;

const { body } = require('express-validator/check');
const ErrorV3 = require('../../models/vo/error-apiv3');


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
      body('socketClientId').if(value => value != null).isInt().withMessage('socketClientId must be string'),
      body('pageTags').if(value => value != null).isArray().withMessage('pageTags must be array'),
    ],
  };

  // TODO write swagger(GW-3384)
  router.post('/', accessTokenParser, loginRequiredStrictly, csrf, validator.createPage, apiV3FormValidator, async(req, res) => {
    const {
      body, grant, grantUserGroupId, pageTags, overwriteScopesOfDescendants, isSlackEnabled, slackChannels, socketClientId,
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

  router.post('/duplicate', accessTokenParser, loginRequiredStrictly, csrf, async(req, res) => {
    const { pageId } = req.body;

    let newPagePath = pathUtils.normalizePath(req.body.pageNameInput);

    const page = await Page.findByIdAndViewer(pageId, req.user);

    if (page == null) {
      res.code = 'Page is not found';
      logger.error('Failed to find the pages');
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

    // check page existence
    const isExist = (await Page.count({ path: req.body.path })) > 0;
    if (isExist) {
      res.code = 'page_exists';
      return res.apiv3Err(new ErrorV3('Page exists', 'already_exists'), 409);
    }

    const createdPage = await Page.create(req.body.path, req.body.body, req.user);

    let savedTags;
    if (req.body.pageTags != null) {
      await PageTagRelation.updatePageTags(createdPage.id, req.body.pageTags);
      savedTags = await PageTagRelation.listTagNamesByPage(createdPage.id);
    }

    const result = { page: pageService.serializeToObj(createdPage), tags: savedTags };

    return res.apiv3(result);
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
