module.exports = function(crowi, app) {
  'use strict';

  const debug = require('debug')('growi:routes:page')
    , logger = require('@alias/logger')('growi:routes:page')
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
    , pagePathUtil = require('../util/pagePathUtil')
    , swig = require('swig-templates')
    , getToday = require('../util/getToday')
    , globalNotificationService = crowi.getGlobalNotificationService()

    , actions = {};

  // register page events

  var pageEvent = crowi.event('page');
  pageEvent.on('update', function(page, user) {
    crowi.getIo().sockets.emit('page edited', {page, user});
  });


  function getPathFromRequest(req) {
    var path = '/' + (req.params[0] || '');
    return path.replace(/\.md$/, '');
  }

  function isUserPage(path) {
    if (path.match(/^\/user\/[^\/]+\/?$/)) {
      return true;
    }

    return false;
  }

  // TODO: total とかでちゃんと計算する
  function generatePager(options) {
    var next = null,
      prev = null,
      offset = parseInt(options.offset, 10),
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
    var path = getPathFromRequest(req);
    var limit = 50;
    var offset = parseInt(req.query.offset)  || 0;
    var SEENER_THRESHOLD = 10;
    // add slash if root
    path = path + (path == '/' ? '' : '/');

    debug('Page list show', path);
    // index page
    var pagerOptions = {
      offset: offset,
      limit: limit
    };
    var queryOptions = {
      offset: offset,
      limit: limit + 1,
      isPopulateRevisionBody: Config.isEnabledTimeline(config),
    };

    var renderVars = {
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
        renderVars.revisionHackmdSynced = portalPage.revisionHackmdSynced;
        renderVars.pageIdOnHackmd = portalPage.pageIdOnHackmd;
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
      renderVars.pages = pagePathUtil.encodePagesPath(pageList);
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
        return res.redirect(encodeURI(page.redirectTo + '?redirectFrom=' + pagePathUtil.encodePagePath(page.path)));
      }

      renderVars.page = page;

      if (page) {
        renderVars.path = page.path;
        renderVars.revision = page.revision;
        renderVars.author = page.revision.author;
        renderVars.revisionHackmdSynced = page.revisionHackmdSynced;
        renderVars.pageIdOnHackmd = page.pageIdOnHackmd;

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
            renderVars.pages = pagePathUtil.encodePagesPath(pageList);

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
    var path = '/trash' + getPathFromRequest(req);
    var limit = 50;
    var offset = parseInt(req.query.offset)  || 0;

    // index page
    var pagerOptions = {
      offset: offset,
      limit: limit
    };
    var queryOptions = {
      offset: offset,
      limit: limit + 1,
      includeDeletedPage: true,
    };

    var renderVars = {
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
      renderVars.pages = pagePathUtil.encodePagesPath(pageList);
      res.render('customlayout-selector/page_list', renderVars);
    }).catch(function(err) {
      debug('Error on rendering deletedPageListShow', err);
    });
  };

  actions.search = function(req, res) {
    // spec: ?q=query&sort=sort_order&author=author_filter
    var query = req.query.q;
    var search = require('../util/search')(crowi);

    search.searchPageByKeyword(query)
    .then(function(pages) {
      debug('pages', pages);

      if (pages.hits.total <= 0) {
        return Promise.resolve([]);
      }

      var ids = pages.hits.hits.map(function(page) {
        return page._id;
      });

      return Page.findListByPageIds(ids);
    }).then(function(pages) {

      res.render('customlayout-selector/page_list', {
        path: '/',
        pages: pagePathUtil.encodePagesPath(pages),
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
      return res.redirect(encodeURI(pageData.redirectTo + '?redirectFrom=' + pagePathUtil.encodePagePath(pageData.path)));
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
    var path = path || getPathFromRequest(req);

    // FIXME: せっかく getPathFromRequest になってるのにここが生 params[0] だとダサイ
    var isMarkdown = req.params[0].match(/.+\.md$/) || false;

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
        return res.redirect(pagePathUtil.encodePagePath(path));
      }

      if (isMarkdown) {
        return res.redirect('/');
      }

      Page.hasPortalPage(path + '/', req.user)
      .then(function(page) {
        if (page) {
          return res.redirect(pagePathUtil.encodePagePath(path) + '/');
        }
        else {
          const fixed = Page.fixToCreatableName(path);
          if (fixed !== path) {
            logger.warn('fixed page name', fixed);
            res.redirect(pagePathUtil.encodePagePath(fixed));
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

  actions.pageEdit = function(req, res) {

    if (!req.form.isValid) {
      req.flash('dangerMessage', 'Request is invalid.');
      return res.redirect(req.headers.referer);
    }

    var pageForm = req.form.pageForm;
    var path = pageForm.path;
    var body = pageForm.body;
    var currentRevision = pageForm.currentRevision;
    var grant = pageForm.grant;
    var grantUserGroupId = pageForm.grantUserGroupId;

    // TODO: make it pluggable
    var notify = pageForm.notify || {};

    debug('notify: ', notify);

    var redirectPath = pagePathUtil.encodePagePath(path);
    var pageData = {};
    var updateOrCreate;
    var previousRevision = false;

    // set to render
    res.locals.pageForm = pageForm;

    // 削除済みページはここで編集不可判定される
    if (!Page.isCreatableName(path)) {
      res.redirect(redirectPath);
      return ;
    }

    var ignoreNotFound = true;
    Page.findPage(path, req.user, null, ignoreNotFound)
    .then(function(data) {
      pageData = data;

      if (data && !data.isUpdatable(currentRevision)) {
        debug('Conflict occured');
        req.flash('dangerMessage', 'Conflict occured');
        return res.redirect(req.headers.referer);
      }

      if (data) {
        previousRevision = data.revision;
        return Page.updatePage(data, body, req.user, { grant, grantUserGroupId })
          .then((page) => {
            // global notification
            globalNotificationService.notifyPageEdit(page);
            return page;
          });
      }
      else {
        // new page
        updateOrCreate = 'create';
        return Page.create(path, body, req.user, { grant, grantUserGroupId })
          .then((page) => {
            // global notification
            globalNotificationService.notifyPageCreate(page);
            return page;
          });
      }
    }).then(function(data) {
      // data is a saved page data with revision.
      pageData = data;
      if (!data) {
        throw new Error('Data not found');
      }
      // TODO: move to events
      if (notify.slack) {
        if (notify.slack.on && notify.slack.channel) {
          data.updateSlackChannel(notify.slack.channel)
          .catch(err => {
            logger.error('Error occured in updating slack channels: ', err);
          });

          if (crowi.slack) {
            const promises = notify.slack.channel.split(',').map(function(chan) {
              return crowi.slack.postPage(pageData, req.user, chan, updateOrCreate, previousRevision);
            });

            Promise.all(promises)
            .catch(err => {
              logger.error('Error occured in sending slack notification: ', err);
            });
          }
        }
      }

      return res.redirect(redirectPath);
    });
  };



  var api = actions.api = {};

  /**
   * redirector
   */
  api.redirector = function(req, res) {
    var id = req.params.id;

    Page.findPageById(id)
    .then(function(pageData) {

      if (pageData.grant == Page.GRANT_RESTRICTED && !pageData.isGrantedFor(req.user)) {
        return Page.pushToGrantedUsers(pageData, req.user);
      }

      return Promise.resolve(pageData);
    }).then(function(page) {

      return res.redirect(pagePathUtil.encodePagePath(page.path));
    }).catch(function(err) {
      return res.redirect('/');
    });
  };

  /**
   * @api {get} /pages.list List pages by user
   * @apiName ListPage
   * @apiGroup Page
   *
   * @apiParam {String} path
   * @apiParam {String} user
   */
  api.list = function(req, res) {
    var username = req.query.user || null;
    var path = req.query.path || null;
    var limit = 50;
    var offset = parseInt(req.query.offset) || 0;

    var pagerOptions = { offset: offset, limit: limit };
    var queryOptions = { offset: offset, limit: limit + 1};

    // Accepts only one of these
    if (username === null && path === null) {
      return res.json(ApiResponse.error('Parameter user or path is required.'));
    }
    if (username !== null && path !== null) {
      return res.json(ApiResponse.error('Parameter user or path is required.'));
    }

    var pageFetcher;
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

      var result = {};
      result.pages = pagePathUtil.encodePagesPath(pages);
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
  api.create = function(req, res) {
    var body = req.body.body || null;
    var pagePath = req.body.path || null;
    var grant = req.body.grant || null;
    var grantUserGroupId = req.body.grantUserGroupId || null;

    if (body === null || pagePath === null) {
      return res.json(ApiResponse.error('Parameters body and path are required.'));
    }

    var ignoreNotFound = true;
    Page.findPage(pagePath, req.user, null, ignoreNotFound)
    .then(function(data) {
      if (data !== null) {
        throw new Error('Page exists');
      }

      return Page.create(pagePath, body, req.user, { grant: grant, grantUserGroupId: grantUserGroupId});
    }).then(function(data) {
      if (!data) {
        throw new Error('Failed to create page.');
      }
      var result = { page: data.toObject() };

      result.page.lastUpdateUser = User.filterToPublicFields(data.lastUpdateUser);
      result.page.creator = User.filterToPublicFields(data.creator);
      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      return res.json(ApiResponse.error(err));
    });

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
  api.update = function(req, res) {
    var pageBody = req.body.body || null;
    var pageId = req.body.page_id || null;
    var revisionId = req.body.revision_id || null;
    var grant = req.body.grant || null;
    var grantUserGroupId = req.body.grantUserGroupId || null;

    if (pageId === null || pageBody === null) {
      return res.json(ApiResponse.error('page_id and body are required.'));
    }

    Page.findPageByIdAndGrantedUser(pageId, req.user)
    .then(function(pageData) {
      if (pageData && revisionId !== null && !pageData.isUpdatable(revisionId)) {
        throw new Error('Revision error.');
      }

      var grantOption = {};
      if (grant != null) {
        grantOption.grant = grant;
      }
      if (grantUserGroupId != null) {
        grantOption.grantUserGroupId = grantUserGroupId;
      }
      return Page.updatePage(pageData, pageBody, req.user, grantOption);
    }).then(function(pageData) {
      var result = {
        page: pageData.toObject(),
      };
      result.page.lastUpdateUser = User.filterToPublicFields(result.page.lastUpdateUser);
      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      debug('error on _api/pages.update', err);
      return res.json(ApiResponse.error(err));
    });
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
  api.get = function(req, res) {
    const pagePath = req.query.path || null;
    const pageId = req.query.page_id || null; // TODO: handling
    const revisionId = req.query.revision_id || null;

    if (!pageId && !pagePath) {
      return res.json(ApiResponse.error(new Error('Parameter path or page_id is required.')));
    }

    let pageFinder;
    if (pageId) { // prioritized
      pageFinder = Page.findPageByIdAndGrantedUser(pageId, req.user);
    }
    else if (pagePath) {
      pageFinder = Page.findPage(pagePath, req.user, revisionId);
    }

    pageFinder.then(function(pageData) {
      var result = {};
      result.page = pageData;

      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      return res.json(ApiResponse.error(err));
    });
  };

  /**
   * @api {post} /pages.seen Mark as seen user
   * @apiName SeenPage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   */
  api.seen = function(req, res) {
    var pageId = req.body.page_id;
    if (!pageId) {
      return res.json(ApiResponse.error('page_id required'));
    }

    Page.findPageByIdAndGrantedUser(pageId, req.user)
    .then(function(page) {
      return page.seen(req.user);
    }).then(function(user) {
      var result = {};
      result.seenUser = user;

      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      debug('Seen user update error', err);
      return res.json(ApiResponse.error(err));
    });
  };

  /**
   * @api {post} /likes.add Like page
   * @apiName LikePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   */
  api.like = function(req, res) {
    var id = req.body.page_id;

    Page.findPageByIdAndGrantedUser(id, req.user)
    .then(function(pageData) {
      return pageData.like(req.user);
    })
    .then(function(page) {
      var result = {page: page};
      res.json(ApiResponse.success(result));
      return page;
    })
    .then((page) => {
      // global notification
      return globalNotificationService.notifyPageLike(page, req.user);
    })
    .catch(function(err) {
      debug('Like failed', err);
      return res.json(ApiResponse.error({}));
    });
  };

  /**
   * @api {post} /likes.remove Unlike page
   * @apiName UnlikePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   */
  api.unlike = function(req, res) {
    var id = req.body.page_id;

    Page.findPageByIdAndGrantedUser(id, req.user)
    .then(function(pageData) {
      return pageData.unlike(req.user);
    }).then(function(data) {
      var result = {page: data};
      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      debug('Unlike failed', err);
      return res.json(ApiResponse.error({}));
    });
  };

  /**
   * @api {get} /pages.updatePost
   * @apiName Get UpdatePost setting list
   * @apiGroup Page
   *
   * @apiParam {String} path
   */
  api.getUpdatePost = function(req, res) {
    var path = req.query.path;
    var UpdatePost = crowi.model('UpdatePost');

    if (!path) {
      return res.json(ApiResponse.error({}));
    }

    UpdatePost.findSettingsByPath(path)
    .then(function(data) {
      data = data.map(function(e) {
        return e.channel;
      });
      debug('Found updatePost data', data);
      var result = {updatePost: data};
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
    var pageId = req.body.page_id;
    var previousRevision = req.body.revision_id || null;

    // get completely flag
    const isCompletely = (req.body.completely != null);
    // get recursively flag
    const isRecursively = (req.body.recursively != null);

    Page.findPageByIdAndGrantedUser(pageId, req.user)
      .then(function(pageData) {
        debug('Delete page', pageData._id, pageData.path);

        if (isCompletely) {
          if (isRecursively) {
            return Page.completelyDeletePageRecursively(pageData, req.user);
          }
          else {
            return Page.completelyDeletePage(pageData, req.user);
          }
        }

        // else

        if (!pageData.isUpdatable(previousRevision)) {
          throw new Error('Someone could update this page, so couldn\'t delete.');
        }

        if (isRecursively) {
          return Page.deletePageRecursively(pageData, req.user);
        }
        else {
          return Page.deletePage(pageData, req.user);
        }
      })
      .then(function(data) {
        debug('Page deleted', data.path);
        var result = {};
        result.page = data;

        res.json(ApiResponse.success(result));
        return data;
      })
      .then((page) => {
        // global notification
        return globalNotificationService.notifyPageDelete(page);
      })
      .catch(function(err) {
        debug('Error occured while get setting', err, err.stack);
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
  api.revertRemove = function(req, res) {
    var pageId = req.body.page_id;

    // get recursively flag
    const isRecursively = (req.body.recursively !== undefined);

    Page.findPageByIdAndGrantedUser(pageId, req.user)
    .then(function(pageData) {

      if (isRecursively) {
        return Page.revertDeletedPageRecursively(pageData, req.user);
      }
      else {
        return Page.revertDeletedPage(pageData, req.user);
      }
    }).then(function(data) {
      debug('Complete to revert deleted page', data.path);
      var result = {};
      result.page = data;

      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      debug('Error occured while get setting', err, err.stack);
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
    var pageId = req.body.page_id;
    var previousRevision = req.body.revision_id || null;
    var newPagePath = Page.normalizePath(req.body.new_path);
    var options = {
      createRedirectPage: req.body.create_redirect || 0,
      moveUnderTrees: req.body.move_trees || 0,
    };
    var isRecursiveMove = req.body.move_recursively || 0;
    var page = {};

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
        var result = {};
        result.page = page;

        return res.json(ApiResponse.success(result));
      })
      .then(() => {
        // global notification
        globalNotificationService.notifyPageMove(page, req.body.path, req.user);
      })
      .catch(function(err) {
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
    var pageId = req.body.page_id;
    var newPagePath = Page.normalizePath(req.body.new_path);

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
    var pageId = req.body.page_id;

    Page.findPageByIdAndGrantedUser(pageId, req.user)
    .then(function(pageData) {
      debug('Unlink page', pageData._id, pageData.path);

      return Page.removeRedirectOriginPageByPath(pageData.path)
        .then(() => pageData);
    }).then(function(data) {
      debug('Redirect Page deleted', data.path);
      var result = {};
      result.page = data;

      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      debug('Error occured while get setting', err, err.stack);
      return res.json(ApiResponse.error('Failed to delete redirect page.'));
    });
  };

  return actions;
};
