/* eslint-disable no-use-before-define */
module.exports = function(crowi, app) {
  const debug = require('debug')('growi:routes:page');
  const logger = require('@alias/logger')('growi:routes:page');
  const pathUtils = require('growi-commons').pathUtils;
  const Page = crowi.model('Page');
  const User = crowi.model('User');
  const Config = crowi.model('Config');
  const config = crowi.getConfig();
  const Bookmark = crowi.model('Bookmark');
  const PageTagRelation = crowi.model('PageTagRelation');
  const UpdatePost = crowi.model('UpdatePost');
  const ApiResponse = require('../util/apiResponse');
  const interceptorManager = crowi.getInterceptorManager();
  const swig = require('swig-templates');
  const getToday = require('../util/getToday');
  const globalNotificationService = crowi.getGlobalNotificationService();

  const actions = {};

  const PORTAL_STATUS_NOT_EXISTS = 0;
  const PORTAL_STATUS_EXISTS = 1;
  const PORTAL_STATUS_FORBIDDEN = 2;

  // register page events

  const pageEvent = crowi.event('page');
  pageEvent.on('create', (page, user, socketClientId) => {
    page = serializeToObj(page); // eslint-disable-line no-param-reassign
    crowi.getIo().sockets.emit('page:create', { page, user, socketClientId });
  });
  pageEvent.on('update', (page, user, socketClientId) => {
    page = serializeToObj(page); // eslint-disable-line no-param-reassign
    crowi.getIo().sockets.emit('page:update', { page, user, socketClientId });
  });
  pageEvent.on('delete', (page, user, socketClientId) => {
    page = serializeToObj(page); // eslint-disable-line no-param-reassign
    crowi.getIo().sockets.emit('page:delete', { page, user, socketClientId });
  });


  function serializeToObj(page) {
    const returnObj = page.toObject();
    if (page.revisionHackmdSynced != null && page.revisionHackmdSynced._id != null) {
      returnObj.revisionHackmdSynced = page.revisionHackmdSynced._id;
    }
    return returnObj;
  }

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
    let next = null;


    let prev = null;

    if (offset > 0) {
      prev = offset - limit;
      if (prev < 0) {
        prev = 0;
      }
    }

    if (totalCount < limit) {
      next = null;
    }
    else {
      next = offset + limit;
    }

    return {
      prev,
      next,
      offset,
    };
  }

  // user notification
  // TODO create '/service/user-notification' module
  async function notifyToSlackByUser(page, user, slackChannels, updateOrCreate, previousRevision) {
    await page.updateSlackChannel(slackChannels)
      .catch((err) => {
        logger.error('Error occured in updating slack channels: ', err);
      });

    if (Config.hasSlackConfig(config)) {
      const promises = slackChannels.split(',').map((chan) => {
        return crowi.slack.postPage(page, user, chan, updateOrCreate, previousRevision);
      });

      Promise.all(promises)
        .catch((err) => {
          logger.error('Error occured in sending slack notification: ', err);
        });
    }
  }

  function addRendarVarsForPage(renderVars, page) {
    renderVars.page = page;
    renderVars.path = page.path;
    renderVars.revision = page.revision;
    renderVars.author = page.revision.author;
    renderVars.pageIdOnHackmd = page.pageIdOnHackmd;
    renderVars.revisionHackmdSynced = page.revisionHackmdSynced;
    renderVars.hasDraftOnHackmd = page.hasDraftOnHackmd;
  }

  async function addRenderVarsForUserPage(renderVars, page, requestUser) {
    const userData = await User.findUserByUsername(User.getUsernameByPath(page.path))
      .populate(User.IMAGE_POPULATION);

    if (userData != null) {
      renderVars.pageUser = userData;
      renderVars.bookmarkList = await Bookmark.findByUser(userData, { limit: 10, populatePage: true, requestUser });
    }
  }

  function addRendarVarsForScope(renderVars, page) {
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
      limit: limit + 1,
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
    renderVars.pages = pathUtils.encodePagesPath(result.pages);
  }

  function replacePlaceholdersOfTemplate(template, req) {
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
    const revisionId = req.query.revision;

    let page = await Page.findByPathAndViewer(path, req.user);

    if (page == null) {
      next();
    }

    const renderVars = {};

    // populate
    page = await page.populateDataToMakePresentation(revisionId);
    addRendarVarsForPage(renderVars, page);
    return res.render('page_presentation', renderVars);
  }

  async function showPageListForCrowiBehavior(req, res, next) {
    const portalPath = pathUtils.addTrailingSlash(getPathFromRequest(req));
    const revisionId = req.query.revision;

    // check whether this page has portal page
    const portalPageStatus = await getPortalPageState(portalPath, req.user);

    let view = 'customlayout-selector/page_list';
    const renderVars = { path: portalPath };

    if (portalPageStatus === PORTAL_STATUS_FORBIDDEN) {
      // inject to req
      req.isForbidden = true;
      view = 'customlayout-selector/forbidden';
    }
    else if (portalPageStatus === PORTAL_STATUS_EXISTS) {
      let portalPage = await Page.findByPathAndViewer(portalPath, req.user);
      portalPage.initLatestRevisionField(revisionId);

      // populate
      portalPage = await portalPage.populateDataToShowRevision();

      addRendarVarsForPage(renderVars, portalPage);
      await addRenderVarsForSlack(renderVars, portalPage);
    }

    const limit = 50;
    const offset = parseInt(req.query.offset) || 0;

    await addRenderVarsForDescendants(renderVars, portalPath, req.user, offset, limit);

    await interceptorManager.process('beforeRenderPage', req, res, renderVars);
    return res.render(view, renderVars);
  }

  async function showPageForGrowiBehavior(req, res, next) {
    const path = getPathFromRequest(req);
    const revisionId = req.query.revision;

    let page = await Page.findByPathAndViewer(path, req.user);

    if (page == null) {
      // check the page is forbidden or just does not exist.
      req.isForbidden = await Page.count({ path }) > 0;
      return next();
    }
    if (page.redirectTo) {
      debug(`Redirect to '${page.redirectTo}'`);
      return res.redirect(encodeURI(`${page.redirectTo}?redirectFrom=${pathUtils.encodePagePath(path)}`));
    }

    logger.debug('Page is found when processing pageShowForGrowiBehavior', page._id, page.path);

    const limit = 50;
    const offset = parseInt(req.query.offset) || 0;
    const renderVars = {};

    let view = 'customlayout-selector/page';

    page.initLatestRevisionField(revisionId);

    // populate
    page = await page.populateDataToShowRevision();
    addRendarVarsForPage(renderVars, page);
    addRendarVarsForScope(renderVars, page);

    await addRenderVarsForSlack(renderVars, page);
    await addRenderVarsForDescendants(renderVars, path, req.user, offset, limit, true);

    if (isUserPage(page.path)) {
      // change template
      view = 'customlayout-selector/user_page';
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

  /**
   *
   * @param {string} path
   * @param {User} user
   * @returns {number} PORTAL_STATUS_NOT_EXISTS(0) or PORTAL_STATUS_EXISTS(1) or PORTAL_STATUS_FORBIDDEN(2)
   */
  async function getPortalPageState(path, user) {
    const portalPath = Page.addSlashOfEnd(path);
    const page = await Page.findByPathAndViewer(portalPath, user);

    if (page == null) {
      // check the page is forbidden or just does not exist.
      const isForbidden = await Page.count({ path: portalPath }) > 0;
      return isForbidden ? PORTAL_STATUS_FORBIDDEN : PORTAL_STATUS_NOT_EXISTS;
    }
    return PORTAL_STATUS_EXISTS;
  }


  actions.showTopPage = function(req, res) {
    return showPageListForCrowiBehavior(req, res);
  };

  /**
   * switch action by behaviorType
   */
  /* eslint-disable no-else-return */
  actions.showPageWithEndOfSlash = function(req, res, next) {
    const behaviorType = Config.behaviorType(config);

    if (!behaviorType || behaviorType === 'crowi') {
      return showPageListForCrowiBehavior(req, res, next);
    }
    else {
      const path = getPathFromRequest(req); // end of slash should be omitted
      // redirect and showPage action will be triggered
      return res.redirect(path);
    }
  };
  /* eslint-enable no-else-return */

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

    const behaviorType = Config.behaviorType(config);

    // check whether this page has portal page
    if (!behaviorType || behaviorType === 'crowi') {
      const portalPagePath = pathUtils.addTrailingSlash(getPathFromRequest(req));
      const hasPortalPage = await Page.count({ path: portalPagePath }) > 0;

      if (hasPortalPage) {
        logger.debug('The portal page is found', portalPagePath);
        return res.redirect(encodeURI(`${portalPagePath}?redirectFrom=${pathUtils.encodePagePath(req.path)}`));
      }
    }

    // delegate to showPageForGrowiBehavior
    return showPageForGrowiBehavior(req, res, next);
  };

  /**
   * switch action by behaviorType
   */
  /* eslint-disable no-else-return */
  actions.trashPageListShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if (!behaviorType || behaviorType === 'crowi') {
      // Crowi behavior for '/trash/*'
      return actions.deletedPageListShow(req, res);
    }
    else {
      // redirect to '/trash'
      return res.redirect('/trash');
    }
  };
  /* eslint-enable no-else-return */

  /**
   * switch action by behaviorType
   */
  /* eslint-disable no-else-return */
  actions.trashPageShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if (!behaviorType || behaviorType === 'crowi') {
      // redirect to '/trash/'
      return res.redirect('/trash/');
    }
    else {
      // Crowi behavior for '/trash/*'
      return actions.deletedPageListShow(req, res);
    }
  };
  /* eslint-enable no-else-return */

  /**
   * switch action by behaviorType
   */
  /* eslint-disable no-else-return */
  actions.deletedPageListShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if (!behaviorType || behaviorType === 'crowi') {
      // Crowi behavior for '/trash/*'
      return actions.deletedPageListShow(req, res);
    }
    else {
      const path = `/trash${getPathFromRequest(req)}`;
      return res.redirect(path);
    }
  };
  /* eslint-enable no-else-return */

  actions.notFound = async function(req, res) {
    const path = getPathFromRequest(req);

    const isCreatable = Page.isCreatableName(path);

    let view;
    const renderVars = { path };

    if (!isCreatable) {
      view = 'customlayout-selector/not_creatable';
    }
    else if (req.isForbidden) {
      view = 'customlayout-selector/forbidden';
    }
    else {
      view = 'customlayout-selector/not_found';

      // retrieve templates
      const template = await Page.findTemplate(path);

      if (template.templateBody) {
        const body = replacePlaceholdersOfTemplate(template.templateBody, req);
        const tags = template.templateTags;
        renderVars.template = body;
        renderVars.templateTags = tags;
      }

      // add scope variables by ancestor page
      const ancestor = await Page.findAncestorByPathAndViewer(path, req.user);
      if (ancestor != null) {
        await ancestor.populate('grantedGroup').execPopulate();
        addRendarVarsForScope(renderVars, ancestor);
      }
    }

    const limit = 50;
    const offset = parseInt(req.query.offset) || 0;
    await addRenderVarsForDescendants(renderVars, path, req.user, offset, limit, true);

    return res.render(view, renderVars);
  };

  actions.deletedPageListShow = async function(req, res) {
    const path = `/trash${getPathFromRequest(req)}`;
    const limit = 50;
    const offset = parseInt(req.query.offset) || 0;

    const queryOptions = {
      offset,
      limit: limit + 1,
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
    renderVars.pages = pathUtils.encodePagesPath(result.pages);
    res.render('customlayout-selector/page_list', renderVars);
  };

  /**
   * redirector
   */
  actions.redirector = async function(req, res) {
    const id = req.params.id;

    const page = await Page.findByIdAndViewer(id, req.user);

    if (page != null) {
      return res.redirect(pathUtils.encodePagePath(page.path));
    }

    return res.redirect('/');
  };


  const api = {};
  actions.api = api;

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

      result.pages = pathUtils.encodePagesPath(result.pages);
      return res.json(ApiResponse.success(result));
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
  };

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
    const pagePath = req.body.path || null;
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

    if (!grant) {
      return res.json(ApiResponse.error('Grant is not selected'));
    }

    // check page existence
    const isExist = await Page.count({ path: pagePath }) > 0;
    if (isExist) {
      return res.json(ApiResponse.error('Page exists', 'already_exists'));
    }

    const options = {
      grant, grantUserGroupId, overwriteScopesOfDescendants, socketClientId, pageTags,
    };
    const createdPage = await Page.create(pagePath, body, req.user, options);

    let savedTags;
    if (pageTags != null) {
      await PageTagRelation.updatePageTags(createdPage.id, pageTags);
      savedTags = await PageTagRelation.listTagNamesByPage(createdPage.id);
    }

    const result = { page: serializeToObj(createdPage), tags: savedTags };
    result.page.lastUpdateUser = User.filterToPublicFields(createdPage.lastUpdateUser);
    result.page.creator = User.filterToPublicFields(createdPage.creator);
    res.json(ApiResponse.success(result));

    // update scopes for descendants
    if (overwriteScopesOfDescendants) {
      Page.applyScopesToDescendantsAsyncronously(createdPage, req.user);
    }

    // global notification
    try {
      await globalNotificationService.notifyPageCreate(createdPage);
    }
    catch (err) {
      logger.error(err);
    }

    // user notification
    if (isSlackEnabled && slackChannels != null) {
      await notifyToSlackByUser(createdPage, req.user, slackChannels, 'create', false);
    }
  };

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

    if (pageId === null || pageBody === null) {
      return res.json(ApiResponse.error('page_id and body are required.'));
    }

    if (!grant) {
      return res.json(ApiResponse.error('Grant is not selected'));
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
    }
    if (grantUserGroupId != null) {
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

    const result = { page: serializeToObj(page), tags: savedTags };
    result.page.lastUpdateUser = User.filterToPublicFields(page.lastUpdateUser);
    res.json(ApiResponse.success(result));

    // update scopes for descendants
    if (overwriteScopesOfDescendants) {
      Page.applyScopesToDescendantsAsyncronously(page, req.user);
    }

    // global notification
    try {
      await globalNotificationService.notifyPageEdit(page);
    }
    catch (err) {
      logger.error(err);
    }

    // user notification
    if (isSlackEnabled && slackChannels != null) {
      await notifyToSlackByUser(page, req.user, slackChannels, 'update', previousRevision);
    }
  };

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
   * @api {get} /pages.exist Get if page exists
   * @apiName GetPage
   * @apiGroup Page
   *
   * @apiParam {String} pages (stringified JSON)
   */
  api.exist = async function(req, res) {
    const pagesAsObj = JSON.parse(req.query.pages || '{}');
    const pagePaths = Object.keys(pagesAsObj);

    await Promise.all(pagePaths.map(async(path) => {
      // check page existence
      const isExist = await Page.count({ path }) > 0;
      pagesAsObj[path] = isExist;
      return;
    }));

    const result = { pages: pagesAsObj };

    return res.json(ApiResponse.success(result));
  };

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
   * @api {post} /likes.add Like page
   * @apiName LikePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   */
  api.like = async function(req, res) {
    const pageId = req.body.page_id;
    if (!pageId) {
      return res.json(ApiResponse.error('page_id required'));
    }
    if (!req.user) {
      return res.json(ApiResponse.error('user required'));
    }

    let page;
    try {
      page = await Page.findByIdAndViewer(pageId, req.user);
      if (page == null) {
        throw new Error(`Page '${pageId}' is not found or forbidden`);
      }
      page = await page.like(req.user);
    }
    catch (err) {
      debug('Seen user update error', err);
      return res.json(ApiResponse.error(err));
    }

    const result = { page };
    result.seenUser = page.seenUsers;
    res.json(ApiResponse.success(result));

    try {
      // global notification
      globalNotificationService.notifyPageLike(page, req.user);
    }
    catch (err) {
      logger.error('Like failed', err);
    }
  };

  /**
   * @api {post} /likes.remove Unlike page
   * @apiName UnlikePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   */
  api.unlike = async function(req, res) {
    const pageId = req.body.page_id;
    if (!pageId) {
      return res.json(ApiResponse.error('page_id required'));
    }
    if (req.user == null) {
      return res.json(ApiResponse.error('user required'));
    }

    let page;
    try {
      page = await Page.findByIdAndViewer(pageId, req.user);
      if (page == null) {
        throw new Error(`Page '${pageId}' is not found or forbidden`);
      }
      page = await page.unlike(req.user);
    }
    catch (err) {
      debug('Seen user update error', err);
      return res.json(ApiResponse.error(err));
    }

    const result = { page };
    result.seenUser = page.seenUsers;
    return res.json(ApiResponse.success(result));
  };

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

    let page = await Page.findByIdAndViewer(pageId, req.user);

    if (page == null) {
      return res.json(ApiResponse.error(`Page '${pageId}' is not found or forbidden`, 'notfound_or_forbidden'));
    }

    debug('Delete page', page._id, page.path);

    try {
      if (isCompletely) {
        if (isRecursively) {
          page = await Page.completelyDeletePageRecursively(page, req.user, options);
        }
        else {
          page = await Page.completelyDeletePage(page, req.user, options);
        }
      }
      else {
        if (!page.isUpdatable(previousRevision)) {
          return res.json(ApiResponse.error('Someone could update this page, so couldn\'t delete.', 'outdated'));
        }

        if (isRecursively) {
          page = await Page.deletePageRecursively(page, req.user, options);
        }
        else {
          page = await Page.deletePage(page, req.user, options);
        }
      }
    }
    catch (err) {
      logger.error('Error occured while get setting', err);
      return res.json(ApiResponse.error('Failed to delete page.', 'unknown'));
    }

    debug('Page deleted', page.path);
    const result = {};
    result.page = page; // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

    res.json(ApiResponse.success(result));

    // global notification
    return globalNotificationService.notifyPageDelete(page);
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
    const isRecursively = (req.body.recursively !== undefined);

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
    const newPagePath = pathUtils.normalizePath(req.body.new_path);
    const options = {
      createRedirectPage: req.body.create_redirect || 0,
      moveUnderTrees: req.body.move_trees || 0,
      socketClientId: +req.body.socketClientId || undefined,
    };
    const isRecursively = req.body.recursively || 0;

    if (!Page.isCreatableName(newPagePath)) {
      return res.json(ApiResponse.error(`Could not use the path '${newPagePath})'`, 'invalid_path'));
    }

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

    // global notification
    globalNotificationService.notifyPageMove(page, req.body.path, req.user);

    return page;
  };

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
    const newPagePath = pathUtils.normalizePath(req.body.new_path);

    const page = await Page.findByIdAndViewer(pageId, req.user);

    if (page == null) {
      return res.json(ApiResponse.error(`Page '${pageId}' is not found or forbidden`, 'notfound_or_forbidden'));
    }

    await page.populateDataToShowRevision();
    const originTags = await page.findRelatedTagsById();

    req.body.path = newPagePath;
    req.body.body = page.revision.body;
    req.body.grant = page.grant;
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

  api.recentCreated = async function(req, res) {
    const pageId = req.query.page_id;

    if (pageId == null) {
      return res.json(ApiResponse.error('param \'pageId\' must not be null'));
    }

    const page = await Page.findById(pageId);
    if (page == null) {
      return res.json(ApiResponse.error(`Page (id='${pageId}') does not exist`));
    }
    if (!isUserPage(page.path)) {
      return res.json(ApiResponse.error(`Page (id='${pageId}') is not a user home`));
    }

    const limit = +req.query.limit || 50;
    const offset = +req.query.offset || 0;
    const queryOptions = { offset, limit };

    try {
      const result = await Page.findListByCreator(page.creator, req.user, queryOptions);
      result.pages = pathUtils.encodePagesPath(result.pages);

      return res.json(ApiResponse.success(result));
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
  };

  return actions;
};
