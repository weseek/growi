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
 *            $ref: '#/components/schemas/Revision'
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
 *
 *      UpdatePost:
 *        description: UpdatePost
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: update post ID
 *            example: 5e0734e472560e001761fa68
 *          __v:
 *            type: number
 *            description: DB record version
 *            example: 0
 *          pathPattern:
 *            type: string
 *            description: path pattern
 *            example: /test
 *          patternPrefix:
 *            type: string
 *            description: patternPrefix prefix
 *            example: /
 *          patternPrefix2:
 *            type: string
 *            description: path
 *            example: test
 *          channel:
 *            type: string
 *            description: channel
 *            example: general
 *          provider:
 *            type: string
 *            description: provider
 *            enum:
 *              - slack
 *            example: slack
 *          creator:
 *            $ref: '#/components/schemas/User'
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 */

/* eslint-disable no-use-before-define */
module.exports = function(crowi, app) {
  const debug = require('debug')('growi:routes:page');
  const logger = require('@alias/logger')('growi:routes:page');
  const swig = require('swig-templates');

  const pathUtils = require('growi-commons').pathUtils;

  const Page = crowi.model('Page');
  const User = crowi.model('User');
  const Bookmark = crowi.model('Bookmark');
  const PageTagRelation = crowi.model('PageTagRelation');
  const UpdatePost = crowi.model('UpdatePost');
  const GlobalNotificationSetting = crowi.model('GlobalNotificationSetting');
  const ShareLink = crowi.model('ShareLink');

  const ApiResponse = require('../util/apiResponse');
  const getToday = require('../util/getToday');

  const { slackNotificationService, configManager } = crowi;
  const interceptorManager = crowi.getInterceptorManager();
  const globalNotificationService = crowi.getGlobalNotificationService();
  const pageService = crowi.pageService;

  const actions = {};

  function getPathFromRequest(req) {
    return pathUtils.normalizePath(req.params[0] || '');
  }

  function isUserPage(path) {
    if (path.match(/^\/user\/[^/]+\/?$/)) {
      return true;
    }

    return false;
  }

  function generatePager(offset, limit, totalCount) {
    let prev = null;

    if (offset > 0) {
      prev = offset - limit;
      if (prev < 0) {
        prev = 0;
      }
    }

    let next = offset + limit;
    if (totalCount < next) {
      next = null;
    }

    return {
      prev,
      next,
      offset,
    };
  }

  // user notification
  // TODO create '/service/user-notification' module
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

  function addRenderVarsForPage(renderVars, page) {
    renderVars.page = page;
    renderVars.revision = page.revision;
    renderVars.pageIdOnHackmd = page.pageIdOnHackmd;
    renderVars.revisionHackmdSynced = page.revisionHackmdSynced;
    renderVars.hasDraftOnHackmd = page.hasDraftOnHackmd;

    if (page.creator != null) {
      renderVars.page.creator = renderVars.page.creator.toObject();
    }
    if (page.revision.author != null) {
      renderVars.revision.author = renderVars.revision.author.toObject();
    }
  }

  function addRenderVarsForPresentation(renderVars, page) {
    renderVars.page = page;
    renderVars.revision = page.revision;
  }

  async function addRenderVarsForUserPage(renderVars, page, requestUser) {
    const userData = await User.findUserByUsername(User.getUsernameByPath(page.path));

    if (userData != null) {
      renderVars.pageUser = userData.toObject();
      renderVars.bookmarkList = await Bookmark.findByUser(userData, { limit: 10, populatePage: true, requestUser });
    }
  }

  function addRenderVarsForScope(renderVars, page) {
    renderVars.grant = page.grant;
    renderVars.grantedGroupId = page.grantedGroup ? page.grantedGroup.id : null;
    renderVars.grantedGroupName = page.grantedGroup ? page.grantedGroup.name : null;
  }

  async function addRenderVarsForSlack(renderVars, page) {
    renderVars.slack = await getSlackChannels(page);
  }

  async function addRenderVarsForDescendants(renderVars, path, requestUser, offset, limit, isRegExpEscapedFromPath) {
    const SEENER_THRESHOLD = 10;

    const queryOptions = {
      offset,
      limit,
      includeTrashed: path.startsWith('/trash/'),
      isRegExpEscapedFromPath,
    };
    const result = await Page.findListWithDescendants(path, requestUser, queryOptions);
    if (result.pages.length > limit) {
      result.pages.pop();
    }

    renderVars.viewConfig = {
      seener_threshold: SEENER_THRESHOLD,
    };
    renderVars.pager = generatePager(result.offset, result.limit, result.totalCount);
    renderVars.pages = result.pages;
  }

  function replacePlaceholdersOfTemplate(template, req) {
    if (req.user == null) {
      return '';
    }

    const definitions = {
      pagepath: getPathFromRequest(req),
      username: req.user.name,
      today: getToday(),
    };
    const compiledTemplate = swig.compile(template);

    return compiledTemplate(definitions);
  }

  async function showPageForPresentation(req, res, next) {
    const path = getPathFromRequest(req);
    const { revisionId } = req.query;

    let page = await Page.findByPathAndViewer(path, req.user);

    if (page == null) {
      next();
    }

    const renderVars = {};

    // populate
    page = await page.populateDataToMakePresentation(revisionId);

    if (page != null) {
      addRenderVarsForPresentation(renderVars, page);
    }

    return res.render('page_presentation', renderVars);
  }

  async function showTopPage(req, res, next) {
    const portalPath = req.path;
    const revisionId = req.query.revision;
    const layoutName = configManager.getConfig('crowi', 'customize:layout');

    const view = `layout-${layoutName}/page_list`;
    const renderVars = { path: portalPath };

    let portalPage = await Page.findByPathAndViewer(portalPath, req.user);
    portalPage.initLatestRevisionField(revisionId);

    // populate
    portalPage = await portalPage.populateDataToShowRevision();

    addRenderVarsForPage(renderVars, portalPage);
    await addRenderVarsForSlack(renderVars, portalPage);

    const sharelinksNumber = await ShareLink.countDocuments({ relatedPage: portalPage._id });
    renderVars.sharelinksNumber = sharelinksNumber;

    const limit = 50;
    const offset = parseInt(req.query.offset) || 0;

    await addRenderVarsForDescendants(renderVars, portalPath, req.user, offset, limit);

    await interceptorManager.process('beforeRenderPage', req, res, renderVars);
    return res.render(view, renderVars);
  }

  async function showPageForGrowiBehavior(req, res, next) {
    const path = getPathFromRequest(req);
    const revisionId = req.query.revision;
    const layoutName = configManager.getConfig('crowi', 'customize:layout');

    let page = await Page.findByPathAndViewer(path, req.user);

    if (page == null) {
      // check the page is forbidden or just does not exist.
      req.isForbidden = await Page.count({ path }) > 0;
      return next();
    }
    if (page.redirectTo) {
      debug(`Redirect to '${page.redirectTo}'`);
      return res.redirect(`${encodeURI(page.redirectTo)}?redirectFrom=${encodeURIComponent(path)}`);
    }

    logger.debug('Page is found when processing pageShowForGrowiBehavior', page._id, page.path);

    const limit = 50;
    const offset = parseInt(req.query.offset) || 0;
    const renderVars = {};

    let view = `layout-${layoutName}/page`;

    page.initLatestRevisionField(revisionId);

    // populate
    page = await page.populateDataToShowRevision();
    addRenderVarsForPage(renderVars, page);
    addRenderVarsForScope(renderVars, page);

    await addRenderVarsForSlack(renderVars, page);
    await addRenderVarsForDescendants(renderVars, path, req.user, offset, limit, true);

    const sharelinksNumber = await ShareLink.countDocuments({ relatedPage: page._id });
    renderVars.sharelinksNumber = sharelinksNumber;

    if (isUserPage(page.path)) {
      // change template
      view = `layout-${layoutName}/user_page`;
      await addRenderVarsForUserPage(renderVars, page, req.user);
    }

    await interceptorManager.process('beforeRenderPage', req, res, renderVars);
    return res.render(view, renderVars);
  }

  const getSlackChannels = async(page) => {
    if (page.extended.slack) {
      return page.extended.slack;
    }

    const data = await UpdatePost.findSettingsByPath(page.path);
    const channels = data.map((e) => { return e.channel }).join(', ');
    return channels;
  };

  actions.showTopPage = function(req, res) {
    return showTopPage(req, res);
  };

  /**
   * Redirect to the page without trailing slash
   */
  actions.showPageWithEndOfSlash = function(req, res, next) {
    return res.redirect(pathUtils.removeTrailingSlash(req.path));
  };

  /**
   * switch action
   *   - presentation mode
   *   - by behaviorType
   */
  actions.showPage = async function(req, res, next) {
    // presentation mode
    if (req.query.presentation) {
      return showPageForPresentation(req, res, next);
    }
    // delegate to showPageForGrowiBehavior
    return showPageForGrowiBehavior(req, res, next);
  };

  actions.showSharedPage = async function(req, res, next) {
    const { linkId } = req.params;
    const revisionId = req.query.revision;

    const layoutName = configManager.getConfig('crowi', 'customize:layout');
    const view = `layout-${layoutName}/shared_page`;

    const shareLink = await ShareLink.findOne({ _id: linkId }).populate('relatedPage');

    if (shareLink == null || shareLink.relatedPage == null) {
      // page or sharelink are not found
      return res.render(`layout-${layoutName}/not_found_shared_page`);
    }

    let page = shareLink.relatedPage;

    // check if share link is expired
    if (shareLink.isExpired()) {
      // page is not found
      return res.render(`layout-${layoutName}/expired_shared_page`);
    }

    const renderVars = {};

    renderVars.sharelink = shareLink;

    // presentation mode
    if (req.query.presentation) {
      page = await page.populateDataToMakePresentation(revisionId);

      // populate
      addRenderVarsForPage(renderVars, page);
      return res.render('page_presentation', renderVars);
    }

    page.initLatestRevisionField(revisionId);

    // populate
    page = await page.populateDataToShowRevision();
    addRenderVarsForPage(renderVars, page);
    addRenderVarsForScope(renderVars, page);

    await interceptorManager.process('beforeRenderPage', req, res, renderVars);
    return res.render(view, renderVars);
  };

  /**
   * switch action by behaviorType
   */
  /* eslint-disable no-else-return */
  actions.trashPageListShowWrapper = function(req, res) {
    // redirect to '/trash'
    return res.redirect('/trash');
  };
  /* eslint-enable no-else-return */

  /**
   * switch action by behaviorType
   */
  /* eslint-disable no-else-return */
  actions.trashPageShowWrapper = function(req, res) {
    // Crowi behavior for '/trash/*'
    return actions.deletedPageListShow(req, res);
  };
  /* eslint-enable no-else-return */

  /**
   * switch action by behaviorType
   */
  /* eslint-disable no-else-return */
  actions.deletedPageListShowWrapper = function(req, res) {
    const path = `/trash${getPathFromRequest(req)}`;
    return res.redirect(path);
  };
  /* eslint-enable no-else-return */

  actions.notFound = async function(req, res) {
    const path = getPathFromRequest(req);

    const isCreatable = Page.isCreatableName(path);
    const layoutName = configManager.getConfig('crowi', 'customize:layout');

    let view;
    const renderVars = { path };

    if (!isCreatable) {
      view = `layout-${layoutName}/not_creatable`;
    }
    else if (req.isForbidden) {
      view = `layout-${layoutName}/forbidden`;
    }
    else {
      view = `layout-${layoutName}/not_found`;

      // retrieve templates
      if (req.user != null) {
        const template = await Page.findTemplate(path);
        if (template.templateBody) {
          const body = replacePlaceholdersOfTemplate(template.templateBody, req);
          const tags = template.templateTags;
          renderVars.template = body;
          renderVars.templateTags = tags;
        }
      }

      // add scope variables by ancestor page
      const ancestor = await Page.findAncestorByPathAndViewer(path, req.user);
      if (ancestor != null) {
        await ancestor.populate('grantedGroup').execPopulate();
        addRenderVarsForScope(renderVars, ancestor);
      }
    }

    const limit = 50;
    const offset = parseInt(req.query.offset) || 0;
    await addRenderVarsForDescendants(renderVars, path, req.user, offset, limit, true);

    return res.render(view, renderVars);
  };

  actions.deletedPageListShow = async function(req, res) {
    // normalizePath makes '/trash/' -> '/trash'
    const path = pathUtils.normalizePath(`/trash${getPathFromRequest(req)}`);
    const layoutName = configManager.getConfig('crowi', 'customize:layout');

    const limit = 50;
    const offset = parseInt(req.query.offset) || 0;

    const queryOptions = {
      offset,
      limit,
      includeTrashed: true,
    };

    const renderVars = {
      page: null,
      path,
      pages: [],
    };

    const result = await Page.findListWithDescendants(path, req.user, queryOptions);

    if (result.pages.length > limit) {
      result.pages.pop();
    }

    renderVars.pager = generatePager(result.offset, result.limit, result.totalCount);
    renderVars.pages = result.pages;
    res.render(`layout-${layoutName}/page_list`, renderVars);
  };

  /**
   * redirector
   */
  actions.redirector = async function(req, res) {
    const id = req.params.id;

    const page = await Page.findByIdAndViewer(id, req.user);

    if (page != null) {
      return res.redirect(encodeURI(page.path));
    }

    return res.redirect('/');
  };


  const api = {};
  actions.api = api;

  /**
   * @swagger
   *
   *    /pages.list:
   *      get:
   *        tags: [Pages, CrowiCompatibles]
   *        operationId: listPages
   *        summary: /pages.list
   *        description: Get list of pages
   *        parameters:
   *          - in: query
   *            name: path
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/path'
   *          - in: query
   *            name: user
   *            schema:
   *              $ref: '#/components/schemas/User/properties/username'
   *          - in: query
   *            name: limit
   *            schema:
   *              $ref: '#/components/schemas/V1PaginateResult/properties/meta/properties/limit'
   *          - in: query
   *            name: offset
   *            schema:
   *              $ref: '#/components/schemas/V1PaginateResult/properties/meta/properties/offset'
   *        responses:
   *          200:
   *            description: Succeeded to get list of pages.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    pages:
   *                      type: array
   *                      items:
   *                        $ref: '#/components/schemas/Page'
   *                      description: page list
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /pages.list List pages by user
   * @apiName ListPage
   * @apiGroup Page
   *
   * @apiParam {String} path
   * @apiParam {String} user
   */
  api.list = async function(req, res) {
    const username = req.query.user || null;
    const path = req.query.path || null;
    const limit = +req.query.limit || 50;
    const offset = parseInt(req.query.offset) || 0;

    const queryOptions = { offset, limit: limit + 1 };

    // Accepts only one of these
    if (username === null && path === null) {
      return res.json(ApiResponse.error('Parameter user or path is required.'));
    }
    if (username !== null && path !== null) {
      return res.json(ApiResponse.error('Parameter user or path is required.'));
    }

    try {
      let result = null;
      if (path == null) {
        const user = await User.findUserByUsername(username);
        if (user === null) {
          throw new Error('The user not found.');
        }
        result = await Page.findListByCreator(user, req.user, queryOptions);
      }
      else {
        result = await Page.findListByStartWith(path, req.user, queryOptions);
      }

      if (result.pages.length > limit) {
        result.pages.pop();
      }

      return res.json(ApiResponse.success(result));
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
  };

  /**
   * @swagger
   *
   *    /pages.create:
   *      post:
   *        tags: [Pages, CrowiCompatibles]
   *        operationId: createPage
   *        summary: /pages.create
   *        description: Create page
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  body:
   *                    $ref: '#/components/schemas/Revision/properties/body'
   *                  path:
   *                    $ref: '#/components/schemas/Page/properties/path'
   *                  grant:
   *                    $ref: '#/components/schemas/Page/properties/grant'
   *                required:
   *                  - body
   *                  - path
   *        responses:
   *          200:
   *            description: Succeeded to create page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    page:
   *                      $ref: '#/components/schemas/Page'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /pages.create Create new page
   * @apiName CreatePage
   * @apiGroup Page
   *
   * @apiParam {String} body
   * @apiParam {String} path
   * @apiParam {String} grant
   * @apiParam {Array} pageTags
   */
  api.create = async function(req, res) {
    const body = req.body.body || null;
    let pagePath = req.body.path || null;
    const grant = req.body.grant || null;
    const grantUserGroupId = req.body.grantUserGroupId || null;
    const overwriteScopesOfDescendants = req.body.overwriteScopesOfDescendants || null;
    const isSlackEnabled = !!req.body.isSlackEnabled; // cast to boolean
    const slackChannels = req.body.slackChannels || null;
    const socketClientId = req.body.socketClientId || undefined;
    const pageTags = req.body.pageTags || undefined;

    if (body === null || pagePath === null) {
      return res.json(ApiResponse.error('Parameters body and path are required.'));
    }

    // check whether path starts slash
    pagePath = pathUtils.addHeadingSlash(pagePath);

    // check page existence
    const isExist = await Page.count({ path: pagePath }) > 0;
    if (isExist) {
      return res.json(ApiResponse.error('Page exists', 'already_exists'));
    }

    const options = { socketClientId };
    if (grant != null) {
      options.grant = grant;
      options.grantUserGroupId = grantUserGroupId;
    }

    const createdPage = await Page.create(pagePath, body, req.user, options);

    let savedTags;
    if (pageTags != null) {
      await PageTagRelation.updatePageTags(createdPage.id, pageTags);
      savedTags = await PageTagRelation.listTagNamesByPage(createdPage.id);
    }

    const result = { page: pageService.serializeToObj(createdPage), tags: savedTags };
    res.json(ApiResponse.success(result));

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
  };

  /**
   * @swagger
   *
   *    /pages.update:
   *      post:
   *        tags: [Pages, CrowiCompatibles]
   *        operationId: updatePage
   *        summary: /pages.update
   *        description: Update page
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  body:
   *                    $ref: '#/components/schemas/Revision/properties/body'
   *                  page_id:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                  revision_id:
   *                    $ref: '#/components/schemas/Revision/properties/_id'
   *                  grant:
   *                    $ref: '#/components/schemas/Page/properties/grant'
   *                required:
   *                  - body
   *                  - page_id
   *                  - revision_id
   *        responses:
   *          200:
   *            description: Succeeded to update page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    page:
   *                      $ref: '#/components/schemas/Page'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /pages.update Update page
   * @apiName UpdatePage
   * @apiGroup Page
   *
   * @apiParam {String} body
   * @apiParam {String} page_id
   * @apiParam {String} revision_id
   * @apiParam {String} grant
   *
   * In the case of the page exists:
   * - If revision_id is specified => update the page,
   * - If revision_id is not specified => force update by the new contents.
   */
  api.update = async function(req, res) {
    const pageBody = req.body.body || null;
    const pageId = req.body.page_id || null;
    const revisionId = req.body.revision_id || null;
    const grant = req.body.grant || null;
    const grantUserGroupId = req.body.grantUserGroupId || null;
    const overwriteScopesOfDescendants = req.body.overwriteScopesOfDescendants || null;
    const isSlackEnabled = !!req.body.isSlackEnabled; // cast to boolean
    const slackChannels = req.body.slackChannels || null;
    const isSyncRevisionToHackmd = !!req.body.isSyncRevisionToHackmd; // cast to boolean
    const socketClientId = req.body.socketClientId || undefined;
    const pageTags = req.body.pageTags || undefined;

    if (pageId === null || pageBody === null || revisionId === null) {
      return res.json(ApiResponse.error('page_id, body and revision_id are required.'));
    }

    // check page existence
    const isExist = await Page.count({ _id: pageId }) > 0;
    if (!isExist) {
      return res.json(ApiResponse.error(`Page('${pageId}' is not found or forbidden`, 'notfound_or_forbidden'));
    }

    // check revision
    let page = await Page.findByIdAndViewer(pageId, req.user);
    if (page != null && revisionId != null && !page.isUpdatable(revisionId)) {
      return res.json(ApiResponse.error('Posted param "revisionId" is outdated.', 'outdated'));
    }

    const options = { isSyncRevisionToHackmd, socketClientId };
    if (grant != null) {
      options.grant = grant;
      options.grantUserGroupId = grantUserGroupId;
    }

    const Revision = crowi.model('Revision');
    const previousRevision = await Revision.findById(revisionId);
    try {
      page = await Page.updatePage(page, pageBody, previousRevision.body, req.user, options);
    }
    catch (err) {
      logger.error('error on _api/pages.update', err);
      return res.json(ApiResponse.error(err));
    }

    let savedTags;
    if (pageTags != null) {
      await PageTagRelation.updatePageTags(pageId, pageTags);
      savedTags = await PageTagRelation.listTagNamesByPage(pageId);
    }

    const result = { page: pageService.serializeToObj(page), tags: savedTags };
    res.json(ApiResponse.success(result));

    // update scopes for descendants
    if (overwriteScopesOfDescendants) {
      Page.applyScopesToDescendantsAsyncronously(page, req.user);
    }

    // global notification
    try {
      await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_EDIT, page, req.user);
    }
    catch (err) {
      logger.error('Edit notification failed', err);
    }

    // user notification
    if (isSlackEnabled) {
      await notifyToSlackByUser(page, req.user, slackChannels, 'update', previousRevision);
    }
  };

  /**
   * @swagger
   *
   *    /pages.get:
   *      get:
   *        tags: [Pages, CrowiCompatibles]
   *        operationId: getPage
   *        summary: /pages.get
   *        description: Get page data
   *        parameters:
   *          - in: query
   *            name: page_id
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *          - in: query
   *            name: path
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/path'
   *          - in: query
   *            name: revision_id
   *            schema:
   *              $ref: '#/components/schemas/Revision/properties/_id'
   *        responses:
   *          200:
   *            description: Succeeded to get page data.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    page:
   *                      $ref: '#/components/schemas/Page'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /pages.get Get page data
   * @apiName GetPage
   * @apiGroup Page
   *
   * @apiParam {String} page_id
   * @apiParam {String} path
   * @apiParam {String} revision_id
   */
  api.get = async function(req, res) {
    const pagePath = req.query.path || null;
    const pageId = req.query.page_id || null; // TODO: handling

    if (!pageId && !pagePath) {
      return res.json(ApiResponse.error(new Error('Parameter path or page_id is required.')));
    }

    let page;
    try {
      if (pageId) { // prioritized
        page = await Page.findByIdAndViewer(pageId, req.user);
      }
      else if (pagePath) {
        page = await Page.findByPathAndViewer(pagePath, req.user);
      }

      if (page == null) {
        throw new Error(`Page '${pageId || pagePath}' is not found or forbidden`, 'notfound_or_forbidden');
      }

      page.initLatestRevisionField();

      // populate
      page = await page.populateDataToShowRevision();
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }

    const result = {};
    result.page = page; // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

    return res.json(ApiResponse.success(result));
  };

  /**
   * @swagger
   *
   *    /pages.exist:
   *      get:
   *        tags: [Pages]
   *        operationId: getPageExistence
   *        summary: /pages.exist
   *        description: Get page existence
   *        parameters:
   *          - in: query
   *            name: pagePaths
   *            schema:
   *              type: string
   *              description: Page path list in JSON Array format
   *              example: '["/", "/user/unknown"]'
   *        responses:
   *          200:
   *            description: Succeeded to get page existence.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    pages:
   *                      type: string
   *                      description: Properties of page path and existence
   *                      example: '{"/": true, "/user/unknown": false}'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /pages.exist Get if page exists
   * @apiName GetPage
   * @apiGroup Page
   *
   * @apiParam {String} pages (stringified JSON)
   */
  api.exist = async function(req, res) {
    const pagePaths = JSON.parse(req.query.pagePaths || '[]');

    const pages = {};
    await Promise.all(pagePaths.map(async(path) => {
      // check page existence
      const isExist = await Page.count({ path }) > 0;
      pages[path] = isExist;
      return;
    }));

    const result = { pages };

    return res.json(ApiResponse.success(result));
  };

  /**
   * @swagger
   *
   *    /pages.getPageTag:
   *      get:
   *        tags: [Pages]
   *        operationId: getPageTag
   *        summary: /pages.getPageTag
   *        description: Get page tag
   *        parameters:
   *          - in: query
   *            name: pageId
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *        responses:
   *          200:
   *            description: Succeeded to get page tags.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    tags:
   *                      $ref: '#/components/schemas/Tags'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /pages.getPageTag get page tags
   * @apiName GetPageTag
   * @apiGroup Page
   *
   * @apiParam {String} pageId
   */
  api.getPageTag = async function(req, res) {
    const result = {};
    try {
      result.tags = await PageTagRelation.listTagNamesByPage(req.query.pageId);
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
    return res.json(ApiResponse.success(result));
  };

  /**
   * @swagger
   *
   *    /pages.seen:
   *      post:
   *        tags: [Pages, CrowiCompatibles]
   *        operationId: seenPage
   *        summary: /pages.seen
   *        description: Mark as seen user
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  page_id:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                required:
   *                  - page_id
   *        responses:
   *          200:
   *            description: Succeeded to be page seen.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    seenUser:
   *                      $ref: '#/components/schemas/Page/properties/seenUsers'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /pages.seen Mark as seen user
   * @apiName SeenPage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   */
  api.seen = async function(req, res) {
    const user = req.user;
    const pageId = req.body.page_id;
    if (!pageId) {
      return res.json(ApiResponse.error('page_id required'));
    }
    if (!req.user) {
      return res.json(ApiResponse.error('user required'));
    }

    let page;
    try {
      page = await Page.findByIdAndViewer(pageId, user);
      if (user != null) {
        page = await page.seen(user);
      }
    }
    catch (err) {
      debug('Seen user update error', err);
      return res.json(ApiResponse.error(err));
    }

    const result = {};
    result.seenUser = page.seenUsers;

    return res.json(ApiResponse.success(result));
  };

  /**
   * @swagger
   *
   *    /pages.updatePost:
   *      get:
   *        tags: [Pages, CrowiCompatibles]
   *        operationId: getUpdatePostPage
   *        summary: /pages.updatePost
   *        description: Get UpdatePost setting list
   *        parameters:
   *          - in: query
   *            name: path
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/path'
   *        responses:
   *          200:
   *            description: Succeeded to get UpdatePost setting list.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    updatePost:
   *                      $ref: '#/components/schemas/UpdatePost'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /pages.updatePost
   * @apiName Get UpdatePost setting list
   * @apiGroup Page
   *
   * @apiParam {String} path
   */
  api.getUpdatePost = function(req, res) {
    const path = req.query.path;
    const UpdatePost = crowi.model('UpdatePost');

    if (!path) {
      return res.json(ApiResponse.error({}));
    }

    UpdatePost.findSettingsByPath(path)
      .then((data) => {
        // eslint-disable-next-line no-param-reassign
        data = data.map((e) => {
          return e.channel;
        });
        debug('Found updatePost data', data);
        const result = { updatePost: data };
        return res.json(ApiResponse.success(result));
      })
      .catch((err) => {
        debug('Error occured while get setting', err);
        return res.json(ApiResponse.error({}));
      });
  };

  /**
   * @api {post} /pages.remove Remove page
   * @apiName RemovePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} revision_id
   */
  api.remove = async function(req, res) {
    const pageId = req.body.page_id;
    const previousRevision = req.body.revision_id || null;
    const socketClientId = req.body.socketClientId || undefined;

    // get completely flag
    const isCompletely = (req.body.completely != null);
    // get recursively flag
    const isRecursively = (req.body.recursively != null);

    const options = { socketClientId };

    const page = await Page.findByIdAndViewer(pageId, req.user);

    if (page == null) {
      return res.json(ApiResponse.error(`Page '${pageId}' is not found or forbidden`, 'notfound_or_forbidden'));
    }

    debug('Delete page', page._id, page.path);

    try {
      if (isCompletely) {
        if (!req.user.canDeleteCompletely(page.creator)) {
          return res.json(ApiResponse.error('You can not delete completely', 'user_not_admin'));
        }
        if (isRecursively) {
          await Page.completelyDeletePageRecursively(page, req.user, options);
        }
        else {
          await Page.completelyDeletePage(page, req.user, options);
        }
      }
      else {
        if (!page.isUpdatable(previousRevision)) {
          return res.json(ApiResponse.error('Someone could update this page, so couldn\'t delete.', 'outdated'));
        }

        if (isRecursively) {
          await Page.deletePageRecursively(page, req.user, options);
        }
        else {
          await Page.deletePage(page, req.user, options);
        }
      }
    }
    catch (err) {
      logger.error('Error occured while get setting', err);
      return res.json(ApiResponse.error('Failed to delete page.', err.message));
    }

    debug('Page deleted', page.path);
    const result = {};
    result.page = page; // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

    res.json(ApiResponse.success(result));

    try {
      // global notification
      await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_DELETE, page, req.user);
    }
    catch (err) {
      logger.error('Delete notification failed', err);
    }
  };

  /**
   * @api {post} /pages.revertRemove Revert removed page
   * @apiName RevertRemovePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   */
  api.revertRemove = async function(req, res, options) {
    const pageId = req.body.page_id;
    const socketClientId = req.body.socketClientId || undefined;

    // get recursively flag
    const isRecursively = (req.body.recursively != null);

    let page;
    try {
      page = await Page.findByIdAndViewer(pageId, req.user);
      if (page == null) {
        throw new Error(`Page '${pageId}' is not found or forbidden`, 'notfound_or_forbidden');
      }

      if (isRecursively) {
        page = await Page.revertDeletedPageRecursively(page, req.user, { socketClientId });
      }
      else {
        page = await Page.revertDeletedPage(page, req.user, { socketClientId });
      }
    }
    catch (err) {
      logger.error('Error occured while get setting', err);
      return res.json(ApiResponse.error('Failed to revert deleted page.'));
    }

    const result = {};
    result.page = page; // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

    return res.json(ApiResponse.success(result));
  };

  /**
   * @swagger
   *
   *    /pages.rename:
   *      post:
   *        tags: [Pages, CrowiCompatibles]
   *        operationId: renamePage
   *        summary: /pages.rename
   *        description: Rename page
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  page_id:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                  path:
   *                    $ref: '#/components/schemas/Page/properties/path'
   *                  revision_id:
   *                    $ref: '#/components/schemas/Revision/properties/_id'
   *                  new_path:
   *                    type: string
   *                    description: new path
   *                    example: /user/alice/new_test
   *                  create_redirect:
   *                    type: boolean
   *                    description: whether redirect page
   *                required:
   *                  - page_id
   *        responses:
   *          200:
   *            description: Succeeded to rename page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    page:
   *                      $ref: '#/components/schemas/Page'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /pages.rename Rename page
   * @apiName RenamePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} path
   * @apiParam {String} revision_id
   * @apiParam {String} new_path New path name.
   * @apiParam {Bool} create_redirect
   */
  api.rename = async function(req, res) {
    const pageId = req.body.page_id;
    const previousRevision = req.body.revision_id || null;
    let newPagePath = pathUtils.normalizePath(req.body.new_path);
    const options = {
      createRedirectPage: (req.body.create_redirect != null),
      updateMetadata: (req.body.remain_metadata == null),
      socketClientId: +req.body.socketClientId || undefined,
    };
    const isRecursively = (req.body.recursively != null);

    if (!Page.isCreatableName(newPagePath)) {
      return res.json(ApiResponse.error(`Could not use the path '${newPagePath})'`, 'invalid_path'));
    }

    // check whether path starts slash
    newPagePath = pathUtils.addHeadingSlash(newPagePath);

    const isExist = await Page.count({ path: newPagePath }) > 0;
    if (isExist) {
      // if page found, cannot cannot rename to that path
      return res.json(ApiResponse.error(`'new_path=${newPagePath}' already exists`, 'already_exists'));
    }

    let page;

    try {
      page = await Page.findByIdAndViewer(pageId, req.user);

      if (page == null) {
        return res.json(ApiResponse.error(`Page '${pageId}' is not found or forbidden`, 'notfound_or_forbidden'));
      }

      if (!page.isUpdatable(previousRevision)) {
        return res.json(ApiResponse.error('Someone could update this page, so couldn\'t delete.', 'outdated'));
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
      return res.json(ApiResponse.error('Failed to update page.', 'unknown'));
    }

    const result = {};
    result.page = page; // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

    res.json(ApiResponse.success(result));

    try {
      // global notification
      await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_MOVE, page, req.user, {
        oldPath: req.body.path,
      });
    }
    catch (err) {
      logger.error('Move notification failed', err);
    }

    return page;
  };

  /**
   * @swagger
   *
   *    /pages.duplicate:
   *      post:
   *        tags: [Pages]
   *        operationId: duplicatePage
   *        summary: /pages.duplicate
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
   * @api {post} /pages.duplicate Duplicate page
   * @apiName DuplicatePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} new_path New path name.
   */
  api.duplicate = async function(req, res) {
    const pageId = req.body.page_id;
    let newPagePath = pathUtils.normalizePath(req.body.new_path);

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

    return api.create(req, res);
  };

  /**
   * @api {post} /pages.unlink Remove the redirecting page
   * @apiName UnlinkPage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} revision_id
   */
  api.unlink = async function(req, res) {
    const path = req.body.path;

    try {
      await Page.removeRedirectOriginPageByPath(path);
      logger.debug('Redirect Page deleted', path);
    }
    catch (err) {
      logger.error('Error occured while get setting', err);
      return res.json(ApiResponse.error('Failed to delete redirect page.'));
    }

    const result = { path };
    return res.json(ApiResponse.success(result));
  };

  return actions;
};
