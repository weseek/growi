const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages'); // eslint-disable-line no-unused-vars

const express = require('express');
const { body } = require('express-validator');
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
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const Page = crowi.model('Page');
  const PageTagRelation = crowi.model('PageTagRelation');
  const GlobalNotificationSetting = crowi.model('GlobalNotificationSetting');

  const globalNotificationService = crowi.getGlobalNotificationService();
  const { pageService, slackNotificationService } = crowi;

  const validator = {
    duplicate: [
      body('pageId').isString(),
      body('pageNameInput').isString(),
    ],
  };

  // user notification
  // TODO GW-3387 create '/service/user-notification' module
  /**
   *
   * @param {Page} page
   * @param {User} user
   * @param {string} slackChannelsStr comma separated string. e.g. 'general,channel1,channel2'
   * @param {boolean} updateOrCreate
   * @param {string} previousRevision
   */
  async function notifyToSlackByUser(page, user, slackChannelsStr, updateOrCreate, previousRevision) {
    await page.updateSlackChannel(slackChannelsStr)
      .catch((err) => {
        logger.error('Error occured in updating slack channels: ', err);
      });


    if (slackNotificationService.hasSlackConfig()) {
      const slackChannels = slackChannelsStr != null ? slackChannelsStr.split(',') : [null];

      const promises = slackChannels.map((chan) => {
        return crowi.slack.postPage(page, user, chan, updateOrCreate, previousRevision);
      });

      Promise.all(promises)
        .catch((err) => {
          logger.error('Error occured in sending slack notification: ', err);
        });
    }
  }

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
    try {
      await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_CREATE, createdPage, req.user);
    }
    catch (err) {
      logger.error('Create notification failed', err);
    }

    // user notification
    if (isSlackEnabled) {
      await notifyToSlackByUser(createdPage, req.user, slackChannels, 'create', false);
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

  router.post('/duplicate', accessTokenParser, loginRequiredStrictly, csrf, validator.duplicate, apiV3FormValidator, async(req, res) => {
    const pageId = req.body.page_id;
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

    res.redirect(307, '/_api/v3/pages');
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
