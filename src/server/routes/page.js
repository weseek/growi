module.exports = function(crowi, app) {
  'use strict';

  const debug = require('debug')('growi:routes:page')
    , logger = require('@alias/logger')('growi:routes:page')
    , pagePathUtils = require('@commons/util/page-path-utils')
    , Page = crowi.model('Page')
    , User = crowi.model('User')
    , Config   = crowi.model('Config')
    , config   = crowi.getConfig()
    , Revision = crowi.model('Revision')
    , Bookmark = crowi.model('Bookmark')
    , PageGroupRelation = crowi.model('PageGroupRelation')
    , UpdatePost = crowi.model('UpdatePost')
    , ApiResponse = require('../util/apiResponse')
    , interceptorManager = crowi.getInterceptorManager()
    , swig = require('swig-templates')
    , getToday = require('../util/getToday')
    , globalNotificationService = crowi.getGlobalNotificationService()

    , actions = {};

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

  // TODO: total とかでちゃんと計算する
  function generatePager(options) {
    let next = null,
      prev = null;
    const offset = parseInt(options.offset, 10),
      limit  = parseInt(options.limit, 10),
      length = options.length || 0;


    if (offset > 0) {
      prev = offset - limit;
      if (prev < 0) {
        prev = 0;
      }
    }

    if (length < limit) {
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

  /**
   * switch action by behaviorType
   */
  actions.pageListShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if (!behaviorType || 'crowi' === behaviorType) {
      return actions.pageListShow(req, res);
    }
    else {
      return actions.pageListShowForCrowiPlus(req, res);
    }
  };
  /**
   * switch action by behaviorType
   */
  actions.pageShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if (!behaviorType || 'crowi' === behaviorType) {
      return actions.pageShow(req, res);
    }
    else {
      return actions.pageShowForCrowiPlus(req, res);
    }
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


  actions.pageListShow = function(req, res) {
    let path = getPathFromRequest(req);
    const limit = 50;
    const offset = parseInt(req.query.offset)  || 0;
    const SEENER_THRESHOLD = 10;
    // add slash if root
    path = path + (path == '/' ? '' : '/');

    debug('Page list show', path);
    // index page
    const pagerOptions = {
      offset: offset,
      limit: limit
    };
    const queryOptions = {
      offset: offset,
      limit: limit + 1,
      isPopulateRevisionBody: Config.isEnabledTimeline(config),
    };

    const renderVars = {
      page: null,
      path: path,
      isPortal: false,
      pages: [],
      tree: [],
    };

    Page.hasPortalPage(path, req.user, req.query.revision)
    .then(function(portalPage) {
      renderVars.page = portalPage;
      renderVars.isPortal = (portalPage != null);

      if (portalPage) {
        renderVars.revision = portalPage.revision;
        renderVars.pageIdOnHackmd = portalPage.pageIdOnHackmd;
        renderVars.revisionHackmdSynced = portalPage.revisionHackmdSynced;
        renderVars.hasDraftOnHackmd = portalPage.hasDraftOnHackmd;
        return Revision.findRevisionList(portalPage.path, {});
      }
      else {
        return Promise.resolve([]);
      }
    })
    .then(function(tree) {
      renderVars.tree = tree;

      return Page.findListByStartWith(path, req.user, queryOptions);
    })
    .then(function(pageList) {

      if (pageList.length > limit) {
        pageList.pop();
      }

      pagerOptions.length = pageList.length;

      renderVars.viewConfig = {
        seener_threshold: SEENER_THRESHOLD,
      };
      renderVars.pager = generatePager(pagerOptions);
      renderVars.pages = pagePathUtils.encodePagesPath(pageList);
    })
    .then(() => {
      return PageGroupRelation.findByPage(renderVars.page);
    })
    .then((pageGroupRelation) => {
      if (pageGroupRelation != null) {
        renderVars.pageRelatedGroup = pageGroupRelation.relatedGroup;
      }
    })
    .then(() => {
      res.render('customlayout-selector/page_list', renderVars);
    }).catch(function(err) {
      debug('Error on rendering pageListShow', err);
    });
  };

  actions.pageListShowForCrowiPlus = function(req, res) {
    let path = getPathFromRequest(req);
    // omit the slash of the last
    path = path.replace((/\/$/), '');
    // redirect
    return res.redirect(path);
  };

  actions.pageShowForCrowiPlus = function(req, res) {
    const path = getPathFromRequest(req);

    const limit = 50;
    const offset = parseInt(req.query.offset)  || 0;
    const SEENER_THRESHOLD = 10;

    // index page
    const pagerOptions = {
      offset: offset,
      limit: limit
    };
    const queryOptions = {
      offset: offset,
      limit: limit + 1,
      isPopulateRevisionBody: Config.isEnabledTimeline(config),
      includeDeletedPage: path.startsWith('/trash/'),
    };

    const renderVars = {
      path: path,
      page: null,
      revision: {},
      author: false,
      pages: [],
      tree: [],
      pageRelatedGroup: null,
      template: null,
      revisionHackmdSynced: null,
      hasDraftOnHackmd: false,
      slack: '',
    };

    let view = 'customlayout-selector/page';

    let isRedirect = false;
    Page.findPage(path, req.user, req.query.revision)
    .then(function(page) {
      debug('Page found', page._id, page.path);

      // redirect
      if (page.redirectTo) {
        debug(`Redirect to '${page.redirectTo}'`);
        isRedirect = true;
        return res.redirect(encodeURI(page.redirectTo + '?redirectFrom=' + pagePathUtils.encodePagePath(page.path)));
      }

      renderVars.page = page;

      if (page) {
        renderVars.path = page.path;
        renderVars.revision = page.revision;
        renderVars.author = page.revision.author;
        renderVars.pageIdOnHackmd = page.pageIdOnHackmd;
        renderVars.revisionHackmdSynced = page.revisionHackmdSynced;
        renderVars.hasDraftOnHackmd = page.hasDraftOnHackmd;

        return Revision.findRevisionList(page.path, {})
        .then(function(tree) {
          renderVars.tree = tree;
        })
        .then(() => {
          return PageGroupRelation.findByPage(renderVars.page);
        })
        .then((pageGroupRelation) => {
          if (pageGroupRelation != null) {
            renderVars.pageRelatedGroup = pageGroupRelation.relatedGroup;
          }
        })
        .then(() => {
          return getSlackChannels(page);
        })
        .then((channels) => {
          renderVars.slack = channels;
        })
        .then(function() {
          const userPage = isUserPage(page.path);
          let userData = null;

          if (userPage) {
            // change template
            view = 'customlayout-selector/user_page';

            return User.findUserByUsername(User.getUsernameByPath(page.path))
            .then(function(data) {
              if (data === null) {
                throw new Error('The user not found.');
              }
              userData = data;
              renderVars.pageUser = userData;

              return Bookmark.findByUser(userData, {limit: 10, populatePage: true, requestUser: req.user});
            }).then(function(bookmarkList) {
              renderVars.bookmarkList = bookmarkList;

              return Page.findListByCreator(userData, {limit: 10}, req.user);
            }).then(function(createdList) {
              renderVars.createdList = createdList;
              return Promise.resolve();
            }).catch(function(err) {
              debug('Error on finding user related entities', err);
              // pass
            });
          }
        });
      }
    })
    // page is not found or user is forbidden
    .catch(function(err) {
      let isForbidden = false;
      if (err.name === 'UserHasNoGrantException') {
        isForbidden = true;
      }

      if (isForbidden) {
        view = 'customlayout-selector/forbidden';
        return;
      }
      else {
        view = 'customlayout-selector/not_found';

        // look for templates
        return Page.findTemplate(path)
          .then(template => {
            if (template) {
              template = replacePlaceholders(template, req);
            }

            renderVars.template = template;
          });
      }
    })
    // get list pages
    .then(function() {
      if (!isRedirect) {
        Page.findListWithDescendants(path, req.user, queryOptions)
          .then(function(pageList) {
            if (pageList.length > limit) {
              pageList.pop();
            }

            pagerOptions.length = pageList.length;

            renderVars.viewConfig = {
              seener_threshold: SEENER_THRESHOLD,
            };
            renderVars.pager = generatePager(pagerOptions);
            renderVars.pages = pagePathUtils.encodePagesPath(pageList);

            return;
          })
          .then(function() {
            return interceptorManager.process('beforeRenderPage', req, res, renderVars);
          })
          .then(function() {
            res.render(req.query.presentation ? 'page_presentation' : view, renderVars);
          })
          .catch(function(err) {
            logger.error('Error on rendering pageListShowForCrowiPlus', err);
          });
      }
    });
  };

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

  const replacePlaceholders = (template, req) => {
    const definitions = {
      pagepath: getPathFromRequest(req),
      username: req.user.name,
      today: getToday(),
    };
    const compiledTemplate = swig.compile(template);

    return compiledTemplate(definitions);
  };

  actions.deletedPageListShow = function(req, res) {
    const path = '/trash' + getPathFromRequest(req);
    const limit = 50;
    const offset = parseInt(req.query.offset)  || 0;

    // index page
    const pagerOptions = {
      offset: offset,
      limit: limit
    };
    const queryOptions = {
      offset: offset,
      limit: limit + 1,
      includeDeletedPage: true,
    };

    const renderVars = {
      page: null,
      path: path,
      pages: [],
    };

    Page.findListWithDescendants(path, req.user, queryOptions)
    .then(function(pageList) {

      if (pageList.length > limit) {
        pageList.pop();
      }

      pagerOptions.length = pageList.length;

      renderVars.pager = generatePager(pagerOptions);
      renderVars.pages = pagePathUtils.encodePagesPath(pageList);
      res.render('customlayout-selector/page_list', renderVars);
    }).catch(function(err) {
      debug('Error on rendering deletedPageListShow', err);
    });
  };

  actions.search = function(req, res) {
    // spec: ?q=query&sort=sort_order&author=author_filter
    const query = req.query.q;
    const search = require('../util/search')(crowi);

    search.searchPageByKeyword(query)
    .then(function(pages) {
      debug('pages', pages);

      if (pages.hits.total <= 0) {
        return Promise.resolve([]);
      }

      const ids = pages.hits.hits.map(function(page) {
        return page._id;
      });

      return Page.findListByPageIds(ids);
    }).then(function(pages) {

      res.render('customlayout-selector/page_list', {
        path: '/',
        pages: pagePathUtils.encodePagesPath(pages),
        pager: generatePager({offset: 0, limit: 50})
      });
    }).catch(function(err) {
      debug('search error', err);
    });
  };

  async function renderPage(pageData, req, res, isForbidden) {
    if (!pageData) {
      let view = 'customlayout-selector/not_found';
      let template = undefined;

      // forbidden
      if (isForbidden) {
        view = 'customlayout-selector/forbidden';
      }
      else {
        const path = getPathFromRequest(req);
        template = await Page.findTemplate(path);
        if (template != null) {
          template = replacePlaceholders(template, req);
        }
      }

      return res.render(view, {
        author: {},
        page: false,
        template,
      });
    }


    if (pageData.redirectTo) {
      return res.redirect(encodeURI(pageData.redirectTo + '?redirectFrom=' + pagePathUtils.encodePagePath(pageData.path)));
    }

    const renderVars = {
      path: pageData.path,
      page: pageData,
      revision: pageData.revision || {},
      author: pageData.revision.author || false,
      slack: '',
    };
    const userPage = isUserPage(pageData.path);
    let userData = null;

    Revision.findRevisionList(pageData.path, {})
    .then(function(tree) {
      renderVars.tree = tree;
    })
    .then(() => {
      return PageGroupRelation.findByPage(renderVars.page);
    })
    .then((pageGroupRelation) => {
      if (pageGroupRelation != null) {
        renderVars.pageRelatedGroup = pageGroupRelation.relatedGroup;
      }
    })
    .then(() => {
      return getSlackChannels(pageData);
    })
    .then(channels => {
      renderVars.slack = channels;
    })
    .then(function() {
      if (userPage) {
        return User.findUserByUsername(User.getUsernameByPath(pageData.path))
        .then(function(data) {
          if (data === null) {
            throw new Error('The user not found.');
          }
          userData = data;
          renderVars.pageUser = userData;

          return Bookmark.findByUser(userData, {limit: 10, populatePage: true, requestUser: req.user});
        }).then(function(bookmarkList) {
          renderVars.bookmarkList = bookmarkList;

          return Page.findListByCreator(userData, {limit: 10}, req.user);
        }).then(function(createdList) {
          renderVars.createdList = createdList;
          return Promise.resolve();
        }).catch(function(err) {
          debug('Error on finding user related entities', err);
          // pass
        });
      }
      else {
        return Promise.resolve();
      }
    }).then(function() {
      return interceptorManager.process('beforeRenderPage', req, res, renderVars);
    }).then(function() {
      let view = 'customlayout-selector/page';
      if (userData) {
        view = 'customlayout-selector/user_page';
      }
      res.render(req.query.presentation ? 'page_presentation' : view, renderVars);
    }).catch(function(err) {
      debug('Error: renderPage()', err);
      if (err) {
        res.redirect('/');
      }
    });
  }

  actions.pageShow = function(req, res) {
    const path = getPathFromRequest(req);

    // FIXME: せっかく getPathFromRequest になってるのにここが生 params[0] だとダサイ
    const isMarkdown = req.params[0].match(/.+\.md$/) || false;

    res.locals.path = path;

    Page.findPage(path, req.user, req.query.revision)
    .then(function(page) {
      debug('Page found', page._id, page.path);

      if (isMarkdown) {
        res.set('Content-Type', 'text/plain');
        return res.send(page.revision.body);
      }

      return renderPage(page, req, res);
    })
    // page is not found or the user is forbidden
    .catch(function(err) {

      let isForbidden = false;
      if (err.name === 'UserHasNoGrantException') {
        isForbidden = true;
      }

      const normalizedPath = Page.normalizePath(path);
      if (normalizedPath !== path) {
        return res.redirect(normalizedPath);
      }

      // pageShow は /* にマッチしてる最後の砦なので、creatableName でない routing は
      // これ以前に定義されているはずなので、こうしてしまって問題ない。
      if (!Page.isCreatableName(path)) {
        // 削除済みページの場合 /trash 以下に移動しているので creatableName になっていないので、表示を許可
        logger.warn('Page is not creatable name.', path);
        res.redirect('/');
        return ;
      }
      if (req.query.revision) {
        return res.redirect(pagePathUtils.encodePagePath(path));
      }

      if (isMarkdown) {
        return res.redirect('/');
      }

      Page.hasPortalPage(path + '/', req.user)
      .then(function(page) {
        if (page) {
          return res.redirect(pagePathUtils.encodePagePath(path) + '/');
        }
        else {
          const fixed = Page.fixToCreatableName(path);
          if (fixed !== path) {
            logger.warn('fixed page name', fixed);
            res.redirect(pagePathUtils.encodePagePath(fixed));
            return ;
          }

          // if guest user
          if (!req.user) {
            res.redirect('/');
          }

          // render editor
          debug('Catch pageShow', err);
          return renderPage(null, req, res, isForbidden);
        }
      }).catch(function(err) {
        debug('Error on rendering pageShow (redirect to portal)', err);
      });
    });
  };

  /**
   * redirector
   */
  actions.redirector = async function(req, res) {
    const id = req.params.id;

    const page = await Page.findOneByIdAndViewer(id, req.user);

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
  api.list = function(req, res) {
    const username = req.query.user || null;
    const path = req.query.path || null;
    const limit = + req.query.limit || 50;
    const offset = parseInt(req.query.offset) || 0;

    const pagerOptions = { offset: offset, limit: limit };
    const queryOptions = { offset: offset, limit: limit + 1};

    // Accepts only one of these
    if (username === null && path === null) {
      return res.json(ApiResponse.error('Parameter user or path is required.'));
    }
    if (username !== null && path !== null) {
      return res.json(ApiResponse.error('Parameter user or path is required.'));
    }

    let pageFetcher;
    if (path === null) {
      pageFetcher = User.findUserByUsername(username)
      .then(function(user) {
        if (user === null) {
          throw new Error('The user not found.');
        }
        return Page.findListByCreator(user, queryOptions, req.user);
      });
    }
    else {
      pageFetcher = Page.findListByStartWith(path, req.user, queryOptions);
    }

    pageFetcher
    .then(function(pages) {
      if (pages.length > limit) {
        pages.pop();
      }
      pagerOptions.length = pages.length;

      const result = {};
      result.pages = pagePathUtils.encodePagesPath(pages);
      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      return res.json(ApiResponse.error(err));
    });
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

    const ignoreNotFound = true;
    const createdPage = await Page.findPage(pagePath, req.user, null, ignoreNotFound)
      .then(function(data) {
        if (data !== null) {
          throw new Error('Page exists');
        }

        const options = {grant, grantUserGroupId, socketClientId};
        return Page.create(pagePath, body, req.user, options);
      })
      .catch(function(err) {
        return res.json(ApiResponse.error(err));
      });

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

    let previousRevision = undefined;
    let updatedPage = await Page.findOneByIdAndViewer(pageId, req.user)
      .then(function(pageData) {
        if (pageData && revisionId !== null && !pageData.isUpdatable(revisionId)) {
          throw new Error('Posted param "revisionId" is outdated.');
        }

        const options = {isSyncRevisionToHackmd, socketClientId};
        if (grant != null) {
          options.grant = grant;
        }
        if (grantUserGroupId != null) {
          options.grantUserGroupId = grantUserGroupId;
        }

        // store previous revision
        previousRevision = pageData.revision;

        return Page.updatePage(pageData, pageBody, req.user, options);
      })
      .catch(function(err) {
        logger.error('error on _api/pages.update', err);
        res.json(ApiResponse.error(err));
      });

    const result = { page: serializeToObj(updatedPage) };
    result.page.lastUpdateUser = User.filterToPublicFields(updatedPage.lastUpdateUser);
    res.json(ApiResponse.success(result));

    // global notification
    try {
      await globalNotificationService.notifyPageEdit(updatedPage);
    }
    catch (err) {
      logger.error(err);
    }

    // user notification
    if (isSlackEnabled && slackChannels != null) {
      await notifyToSlackByUser(updatedPage, req.user, slackChannels, 'update', previousRevision);
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
    const revisionId = req.query.revision_id || null;

    if (!pageId && !pagePath) {
      return res.json(ApiResponse.error(new Error('Parameter path or page_id is required.')));
    }

    let page;
    try {
      if (pageId) { // prioritized
        page = await Page.findOneByIdAndViewer(pageId, req.user);
      }
      else if (pagePath) {
        page = await Page.findPage(pagePath, req.user, revisionId);
      }
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
      page = await Page.findOneByIdAndViewer(pageId, req.user);
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
      page = await Page.findOneByIdAndViewer(pageId, req.user);
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
      page = await Page.findOneByIdAndViewer(pageId, req.user);
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
  api.remove = function(req, res) {
    const pageId = req.body.page_id;
    const previousRevision = req.body.revision_id || null;
    const socketClientId = req.body.socketClientId || undefined;

    // get completely flag
    const isCompletely = (req.body.completely != null);
    // get recursively flag
    const isRecursively = (req.body.recursively != null);

    const options = {socketClientId};

    Page.findPageByIdAndGrantedUser(pageId, req.user)
      .then(function(pageData) {
        debug('Delete page', pageData._id, pageData.path);

        if (isCompletely) {
          if (isRecursively) {
            return Page.completelyDeletePageRecursively(pageData, req.user, options);
          }
          else {
            return Page.completelyDeletePage(pageData, req.user, options);
          }
        }

        // else

        if (!pageData.isUpdatable(previousRevision)) {
          throw new Error('Someone could update this page, so couldn\'t delete.');
        }

        if (isRecursively) {
          return Page.deletePageRecursively(pageData, req.user, options);
        }
        else {
          return Page.deletePage(pageData, req.user, options);
        }
      })
      .then(function(data) {
        debug('Page deleted', data.path);
        const result = {};
        result.page = data;   // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

        res.json(ApiResponse.success(result));
        return data;
      })
      .then((page) => {
        // global notification
        return globalNotificationService.notifyPageDelete(page);
      })
      .catch(function(err) {
        logger.error('Error occured while get setting', err, err.stack);
        return res.json(ApiResponse.error('Failed to delete page.'));
      });
  };

  /**
   * @api {post} /pages.revertRemove Revert removed page
   * @apiName RevertRemovePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   */
  api.revertRemove = function(req, res, options) {
    const pageId = req.body.page_id;
    const socketClientId = req.body.socketClientId || undefined;

    // get recursively flag
    const isRecursively = (req.body.recursively !== undefined);

    Page.findPageByIdAndGrantedUser(pageId, req.user)
    .then(function(pageData) {

      if (isRecursively) {
        return Page.revertDeletedPageRecursively(pageData, req.user, {socketClientId});
      }
      else {
        return Page.revertDeletedPage(pageData, req.user, {socketClientId});
      }
    }).then(function(data) {
      const result = {};
      result.page = data;   // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      logger.error('Error occured while get setting', err, err.stack);
      return res.json(ApiResponse.error('Failed to revert deleted page.'));
    });
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
  api.rename = function(req, res) {
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

    Page.findPageByPath(newPagePath)
    .then(function(page) {
      if (page != null) {
        // if page found, cannot cannot rename to that path
        return res.json(ApiResponse.error(`このページ名は作成できません (${newPagePath})。ページが存在します。`));
      }

      Page.findPageById(pageId)
      .then(function(pageData) {
        page = pageData;
        if (!pageData.isUpdatable(previousRevision)) {
          throw new Error('Someone could update this page, so couldn\'t delete.');
        }

        if (isRecursiveMove) {
          return Page.renameRecursively(pageData, newPagePath, req.user, options);
        }
        else {
          return Page.rename(pageData, newPagePath, req.user, options);
        }

      })
      .then(function() {
        const result = {};
        result.page = page;   // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

        return res.json(ApiResponse.success(result));
      })
      .then(() => {
        // global notification
        globalNotificationService.notifyPageMove(page, req.body.path, req.user);
      })
      .catch(function(err) {
        logger.error(err);
        return res.json(ApiResponse.error('Failed to update page.'));
      });
    });

  };

  /**
   * @api {post} /pages.duplicate Duplicate page
   * @apiName DuplicatePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} new_path
   */
  api.duplicate = function(req, res) {
    const pageId = req.body.page_id;
    const newPagePath = Page.normalizePath(req.body.new_path);

    Page.findPageById(pageId)
      .then(function(pageData) {
        req.body.path = newPagePath;
        req.body.body = pageData.revision.body;
        req.body.grant = pageData.grant;

        return api.create(req, res);
      });
  };

  /**
   * @api {post} /pages.unlink Remove the redirecting page
   * @apiName UnlinkPage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} revision_id
   */
  api.unlink = function(req, res) {
    const pageId = req.body.page_id;

    Page.findPageByIdAndGrantedUser(pageId, req.user)
    .then(function(pageData) {
      debug('Unlink page', pageData._id, pageData.path);

      return Page.removeRedirectOriginPageByPath(pageData.path)
        .then(() => pageData);
    }).then(function(data) {
      debug('Redirect Page deleted', data.path);
      const result = {};
      result.page = data;   // TODO consider to use serializeToObj method -- 2018.08.06 Yuki Takei

      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      debug('Error occured while get setting', err, err.stack);
      return res.json(ApiResponse.error('Failed to delete redirect page.'));
    });
  };

  api.recentCreated = async function(req, res) {
    const pageId = req.query.page_id;

    if (pageId == null) {
      return res.json(ApiResponse.error('param \'pageId\' must not be null'));
    }

    const page = await Page.findPageById(pageId);
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
      let pages = await Page.findListByCreator(page.creator, queryOptions, req.user);

      const result = {};
      result.pages = pagePathUtils.encodePagesPath(pages);

      return res.json(ApiResponse.success(result));
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
  };

  return actions;
};
