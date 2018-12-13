module.exports = function(crowi, app) {
  'use strict';

  const debug = require('debug')('growi:routes:page')
    , logger = require('@alias/logger')('growi:routes:page')
    , pagePathUtils = require('@commons/util/page-path-utils')
    , Page = crowi.model('Page')
    , User = crowi.model('User')
    , Config   = crowi.model('Config')
    , config   = crowi.getConfig()
    , Bookmark = crowi.model('Bookmark')
    , UpdatePost = crowi.model('UpdatePost')
    , ApiResponse = require('../util/apiResponse')
    , interceptorManager = crowi.getInterceptorManager()
    , swig = require('swig-templates')
    , getToday = require('../util/getToday')
    , globalNotificationService = crowi.getGlobalNotificationService()

    , actions = {};

  const PORTAL_STATUS_NOT_EXISTS = 0;
  const PORTAL_STATUS_EXISTS = 1;
  const PORTAL_STATUS_FORBIDDEN = 2;

  // register page events

  const pageEvent = crowi.event('page');
  pageEvent.on('create', function(page, user, socketClientId) {
    page = serializeToObj(page);
    crowi.getIo().sockets.emit('page:create', {page, user, socketClientId});
  });
  pageEvent.on('update', function(page, user, socketClientId) {
    page = serializeToObj(page);
    crowi.getIo().sockets.emit('page:update', {page, user, socketClientId});
  });
  pageEvent.on('delete', function(page, user, socketClientId) {
    page = serializeToObj(page);
    crowi.getIo().sockets.emit('page:delete', {page, user, socketClientId});
  });


  function serializeToObj(page) {
    const returnObj = page.toObject();
    if (page.revisionHackmdSynced != null && page.revisionHackmdSynced._id != null) {
      returnObj.revisionHackmdSynced = page.revisionHackmdSynced._id;
    }
    return returnObj;
  }

  function getPathFromRequest(req) {
    const path = '/' + (req.params[0] || '');
    return path.replace(/\.md$/, '');
  }

  function isUserPage(path) {
    if (path.match(/^\/user\/[^/]+\/?$/)) {
      return true;
    }

    return false;
  }

  function generatePager(offset, limit, totalCount) {
    let next = null,
      prev = null;

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
      prev: prev,
      next: next,
      offset: offset,
    };
  }

  // user notification
  // TODO create '/service/user-notification' module
  async function notifyToSlackByUser(page, user, slackChannels, updateOrCreate, previousRevision) {
    await page.updateSlackChannel(slackChannels)
      .catch(err => {
        logger.error('Error occured in updating slack channels: ', err);
      });

    if (crowi.slack) {
      const promises = slackChannels.split(',').map(function(chan) {
        return crowi.slack.postPage(page, user, chan, updateOrCreate, previousRevision);
      });

      Promise.all(promises)
      .catch(err => {
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
    const userData = await User.findUserByUsername(User.getUsernameByPath(page.path));
    if (userData != null) {
      renderVars.pageUser = userData;
      renderVars.bookmarkList = await Bookmark.findByUser(userData, {limit: 10, populatePage: true, requestUser: requestUser});
      renderVars.createdList = await Page.findListByCreator(userData, {limit: 10}, requestUser);
    }
  }

  async function addRenderVarsForSlack(renderVars, page) {
    renderVars.slack = await getSlackChannels(page);
  }

  async function addRenderVarsForDescendants(renderVars, path, requestUser, offset, limit, isRegExpEscapedFromPath) {
    const SEENER_THRESHOLD = 10;

    const queryOptions = {
      offset: offset,
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
    renderVars.pages = pagePathUtils.encodePagesPath(result.pages);
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
    let path = getPathFromRequest(req);
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
    const path = Page.addSlashOfEnd(getPathFromRequest(req));
    const revisionId = req.query.revision;

    // check whether this page has portal page
    const portalPageStatus = await getPortalPageState(path, req.user);

    const renderVars = { path };

    if (portalPageStatus === PORTAL_STATUS_FORBIDDEN) {
      // inject to req
      req.isForbidden = true;
      return next();
    }
    else if (portalPageStatus === PORTAL_STATUS_EXISTS) {
      let portalPage = await Page.findByPathAndViewer(path, req.user);
      portalPage.initLatestRevisionField(revisionId);

      // populate
      portalPage = await portalPage.populateDataToShowRevision();

      addRendarVarsForPage(renderVars, portalPage);
      await addRenderVarsForSlack(renderVars, portalPage);
    }

    const limit = 50;
    const offset = parseInt(req.query.offset)  || 0;

    await addRenderVarsForDescendants(renderVars, path, req.user, offset, limit);

    await interceptorManager.process('beforeRenderPage', req, res, renderVars);
    return res.render('customlayout-selector/page_list', renderVars);
  }

  async function showPageForGrowiBehavior(req, res, next) {
    const path = getPathFromRequest(req);
    const revisionId = req.query.revision;

    let page = await Page.findByPathAndViewer(path, req.user);

    if (page == null) {
      // check the page is forbidden or just does not exist.
      req.isForbidden = await Page.count({path}) > 0;
      return next();
    }
    else if (page.redirectTo) {
      debug(`Redirect to '${page.redirectTo}'`);
      return res.redirect(encodeURI(page.redirectTo + '?redirectFrom=' + pagePathUtils.encodePagePath(page.path)));
    }

    logger.debug('Page is found when processing pageShowForGrowiBehavior', page._id, page.path);

    const limit = 50;
    const offset = parseInt(req.query.offset)  || 0;
    const renderVars = {};

    let view = 'customlayout-selector/page';

    page.initLatestRevisionField(revisionId);

    // populate
    page = await page.populateDataToShowRevision();
    addRendarVarsForPage(renderVars, page);

    await addRenderVarsForSlack(renderVars, page);
    await addRenderVarsForDescendants(renderVars, path, req.user, offset, limit);

    if (isUserPage(page.path)) {
      // change template
      view = 'customlayout-selector/user_page';
      await addRenderVarsForUserPage(renderVars, page, req.user);
    }

    await interceptorManager.process('beforeRenderPage', req, res, renderVars);
    return res.render(view, renderVars);
  }

  const getSlackChannels = async page => {
    if (page.extended.slack) {
      return page.extended.slack;
    }
    else {
      const data = await UpdatePost.findSettingsByPath(page.path);
      const channels = data.map(e => e.channel).join(', ');
      return channels;
    }
  };

  /**
   *
   * @param {string} path
   * @param {User} user
   * @returns {number} PORTAL_STATUS_NOT_EXISTS(0) or PORTAL_STATUS_EXISTS(1) or PORTAL_STATUS_FORBIDDEN(2)
   */
  async function getPortalPageState(path, user) {
    const portalPath = Page.addSlashOfEnd(path);
    let page = await Page.findByPathAndViewer(portalPath, user);

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
  actions.showPageWithEndOfSlash = function(req, res, next) {
    const behaviorType = Config.behaviorType(config);

    if (!behaviorType || 'crowi' === behaviorType) {
      return showPageListForCrowiBehavior(req, res, next);
    }
    else {
      let path = getPathFromRequest(req);   // end of slash should be omitted
      // redirect and showPage action will be triggered
      return res.redirect(path);
    }
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

    const behaviorType = Config.behaviorType(config);

    // check whether this page has portal page
    if (!behaviorType || 'crowi' === behaviorType) {
      const portalPagePath = Page.addSlashOfEnd(getPathFromRequest(req));
      let hasPortalPage = await Page.count({ path: portalPagePath }) > 0;

      if (hasPortalPage) {
        logger.debug('The portal page is found', portalPagePath);
        return res.redirect(portalPagePath);
      }
    }

    // delegate to showPageForGrowiBehavior
    return showPageForGrowiBehavior(req, res, next);
  };
  /**
   * switch action by behaviorType
   */
  actions.trashPageListShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if (!behaviorType || 'crowi' === behaviorType) {
      // Crowi behavior for '/trash/*'
      return actions.deletedPageListShow(req, res);
    }
    else {
      // redirect to '/trash'
      return res.redirect('/trash');
    }
  };
  /**
   * switch action by behaviorType
   */
  actions.trashPageShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if (!behaviorType || 'crowi' === behaviorType) {
      // redirect to '/trash/'
      return res.redirect('/trash/');
    }
    else {
      // Crowi behavior for '/trash/*'
      return actions.deletedPageListShow(req, res);
    }

  };
  /**
   * switch action by behaviorType
   */
  actions.deletedPageListShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if (!behaviorType || 'crowi' === behaviorType) {
      // Crowi behavior for '/trash/*'
      return actions.deletedPageListShow(req, res);
    }
    else {
      const path = '/trash' + getPathFromRequest(req);
      return res.redirect(path);
    }
  };

  actions.notFound = async function(req, res) {
    const path = getPathFromRequest(req);

    let view;
    const renderVars = { path };

    if (req.isForbidden) {
      view = 'customlayout-selector/forbidden';
    }
    else {
      view = 'customlayout-selector/not_found';

      // retrieve templates
      let template = await Page.findTemplate(path);
      if (template != null) {
        template = replacePlaceholdersOfTemplate(template, req);
        renderVars.template = template;
      }
    }

    const limit = 50;
    const offset = parseInt(req.query.offset)  || 0;
    await addRenderVarsForDescendants(renderVars, path, req.user, offset, limit);

    return res.render(view, renderVars);
  };

  actions.deletedPageListShow = async function(req, res) {
    const path = '/trash' + getPathFromRequest(req);
    const limit = 50;
    const offset = parseInt(req.query.offset)  || 0;

    const queryOptions = {
      offset: offset,
      limit: limit + 1,
      includeTrashed: true,
    };

    const renderVars = {
      page: null,
      path: path,
      pages: [],
    };

    const result = await Page.findListWithDescendants(path, req.user, queryOptions);

    if (result.pages.length > limit) {
      result.pages.pop();
    }

    renderVars.pager = generatePager(result.offset, result.limit, result.totalCount);
    renderVars.pages = pagePathUtils.encodePagesPath(result.pages);
    res.render('customlayout-selector/page_list', renderVars);

  };

  /**
   * redirector
   */
  actions.redirector = async function(req, res) {
    const id = req.params.id;

    const page = await Page.findByIdAndViewer(id, req.user);

    if (page != null) {
      return res.redirect(pagePathUtils.encodePagePath(page.path));
    }

    return res.redirect('/');
  };


  const api = actions.api = {};

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
    const limit = + req.query.limit || 50;
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

      result.pages = pagePathUtils.encodePagesPath(result.pages);
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
   */
  api.create = async function(req, res) {
    const body = req.body.body || null;
    const pagePath = req.body.path || null;
    const grant = req.body.grant || null;
    const grantUserGroupId = req.body.grantUserGroupId || null;
    const isSlackEnabled = !!req.body.isSlackEnabled;   // cast to boolean
    const slackChannels = req.body.slackChannels || null;
    const socketClientId = req.body.socketClientId || undefined;

    if (body === null || pagePath === null) {
      return res.json(ApiResponse.error('Parameters body and path are required.'));
    }

    // check page existence
    const isExist = await Page.count({path: pagePath}) > 0;
    if (isExist) {
      return res.json(ApiResponse.error('Page exists'));
    }

    const options = {grant, grantUserGroupId, socketClientId};
    const createdPage = await Page.create(pagePath, body, req.user, options);

    const result = { page: serializeToObj(createdPage) };
    result.page.lastUpdateUser = User.filterToPublicFields(createdPage.lastUpdateUser);
    result.page.creator = User.filterToPublicFields(createdPage.creator);
    res.json(ApiResponse.success(result));

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
    const isSlackEnabled = !!req.body.isSlackEnabled;                     // cast to boolean
    const slackChannels = req.body.slackChannels || null;
    const isSyncRevisionToHackmd = !!req.body.isSyncRevisionToHackmd;     // cast to boolean
    const socketClientId = req.body.socketClientId || undefined;

    if (pageId === null || pageBody === null) {
      return res.json(ApiResponse.error('page_id and body are required.'));
    }

    // check page existence
    const isExist = await Page.count({_id: pageId}) > 0;
    if (!isExist) {
      return res.json(ApiResponse.error(`Page('${pageId}' is not found or forbidden`));
    }

    // check revision
    let page = await Page.findByIdAndViewer(pageId, req.user);
    if (page != null && revisionId != null && !page.isUpdatable(revisionId)) {
      return res.json(ApiResponse.error('Posted param "revisionId" is outdated.'));
    }

    const options = {isSyncRevisionToHackmd, socketClientId};
    if (grant != null) {
      options.grant = grant;
    }
    if (grantUserGroupId != null) {
      options.grantUserGroupId = grantUserGroupId;
    }

    try {
      page = await Page.updatePage(page, pageBody, req.user, options);
    }
    catch (err) {
      logger.error('error on _api/pages.update', err);
      return res.json(ApiResponse.error(err));
    }

    const result = { page: serializeToObj(page) };
    result.page.lastUpdateUser = User.filterToPublicFields(page.lastUpdateUser);
    res.json(ApiResponse.success(result));

    // global notification
    try {
      await globalNotificationService.notifyPageEdit(page);
    }
    catch (err) {
      logger.error(err);
    }

    // user notification
    if (isSlackEnabled && slackChannels != null) {
      const Revision = crowi.model('Revision');
      const previousRevision = await Revision.findById(page.revision);
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
        throw new Error(`Page '${pageId || pagePath}' is not found or forbidden`);
      }

      page.initLatestRevisionField();

      // populate
      page = await page.populateDataToShowRevision();
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }

    const result = {};
    result.page = page;   // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

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
    const pageId = req.body.page_id;
    if (!pageId) {
      return res.json(ApiResponse.error('page_id required'));
    }
    else if (!req.user) {
      return res.json(ApiResponse.error('user required'));
    }

    let page;
    try {
      page = await Page.findByIdAndViewer(pageId, req.user);
      if (req.user != null) {
        page = await page.seen(req.user);
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
    else if (!req.user) {
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
    else if (req.user == null) {
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
    .then(function(data) {
      data = data.map(function(e) {
        return e.channel;
      });
      debug('Found updatePost data', data);
      const result = {updatePost: data};
      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
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

    const options = {socketClientId};

    let page = await Page.findByIdAndViewer(pageId, req.user);

    if (page == null) {
      return res.json(ApiResponse.error(`Page '${pageId}' is not found or forbidden`));
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
          throw new Error('Someone could update this page, so couldn\'t delete.');
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
      return res.json(ApiResponse.error('Failed to delete page.'));
    }

    debug('Page deleted', page.path);
    const result = {};
    result.page = page;   // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

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
        throw new Error(`Page '${pageId}' is not found or forbidden`);
      }

      if (isRecursively) {
        page = await Page.revertDeletedPageRecursively(page, req.user, {socketClientId});
      }
      else {
        page = await Page.revertDeletedPage(page, req.user, {socketClientId});
      }
    }
    catch (err) {
      logger.error('Error occured while get setting', err);
      return res.json(ApiResponse.error('Failed to revert deleted page.'));
    }

    const result = {};
    result.page = page;   // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

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
   * @apiParam {String} new_path
   * @apiParam {Bool} create_redirect
   */
  api.rename = async function(req, res) {
    const pageId = req.body.page_id;
    const previousRevision = req.body.revision_id || null;
    const newPagePath = Page.normalizePath(req.body.new_path);
    const options = {
      createRedirectPage: req.body.create_redirect || 0,
      moveUnderTrees: req.body.move_trees || 0,
      socketClientId: +req.body.socketClientId || undefined,
    };
    const isRecursiveMove = req.body.move_recursively || 0;

    if (!Page.isCreatableName(newPagePath)) {
      return res.json(ApiResponse.error(`このページ名は作成できません (${newPagePath})`));
    }

    const isExist = await Page.count({ path: newPagePath }) > 0;
    if (isExist) {
      // if page found, cannot cannot rename to that path
      return res.json(ApiResponse.error(`'new_path=${newPagePath}' already exists`));
    }

    let page;

    try {
      page = await Page.findByIdAndViewer(pageId, req.user);

      if (page == null) {
        throw new Error(`Page '${pageId}' is not found or forbidden`);
      }

      if (!page.isUpdatable(previousRevision)) {
        throw new Error('Someone could update this page, so couldn\'t delete.');
      }

      if (isRecursiveMove) {
        page = await Page.renameRecursively(page, newPagePath, req.user, options);
      }
      else {
        page = await Page.rename(page, newPagePath, req.user, options);
      }
    }
    catch (err) {
      logger.error(err);
      return res.json(ApiResponse.error('Failed to update page.'));
    }

    const result = {};
    result.page = page;   // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

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
   * @apiParam {String} new_path
   */
  api.duplicate = async function(req, res) {
    const pageId = req.body.page_id;
    const newPagePath = Page.normalizePath(req.body.new_path);

    const page = await Page.findByIdAndViewer(pageId, req.user);

    if (page == null) {
      throw new Error(`Page '${pageId}' is not found or forbidden`);
    }

    await page.populateDataToShowRevision();

    req.body.path = newPagePath;
    req.body.body = page.revision.body;
    req.body.grant = page.grant;

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

    const limit = + req.query.limit || 50;
    const offset = + req.query.offset || 0;
    const queryOptions = { offset: offset, limit: limit };

    try {
      let result = await Page.findListByCreator(page.creator, req.user, queryOptions);
      result.pages = pagePathUtils.encodePagesPath(result.pages);

      return res.json(ApiResponse.success(result));
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
  };

  return actions;
};
