module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('crowi:routes:page')
    , Page = crowi.model('Page')
    , User = crowi.model('User')
    , Config   = crowi.model('Config')
    , config   = crowi.getConfig()
    , Revision = crowi.model('Revision')
    , Bookmark = crowi.model('Bookmark')
    , ApiResponse = require('../util/apiResponse')
    , interceptorManager = crowi.getInterceptorManager()

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
    } else {
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

    if ('crowi-plus' === behaviorType) {
      return actions.pageListShowForCrowiPlus(req, res);
    }
    else {
      return actions.pageListShow(req, res);
    }
  }
  /**
   * switch action by behaviorType
   */
  actions.pageShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if ('crowi-plus' === behaviorType) {
      return actions.pageShowForCrowiPlus(req, res);
    }
    else {
      return actions.pageShow(req, res);
    }
  }
  /**
   * switch action by behaviorType
   */
  actions.trashPageListShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if ('crowi-plus' === behaviorType) {
      // redirect to '/trash'
      return res.redirect('/trash');
    }
    // official Crowi behavior for '/trash/*'
    else {
      return actions.deletedPageListShow(req, res);
    }
  }
  /**
   * switch action by behaviorType
   */
  actions.trashPageShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if ('crowi-plus' === behaviorType) {
      // official Crowi behavior for '/trash/*'
      return actions.deletedPageListShow(req, res);
    }
    else {
      // redirect to '/trash/'
      return res.redirect('/trash/');
    }

  }
  /**
   * switch action by behaviorType
   */
  actions.deletedPageListShowWrapper = function(req, res) {
    const behaviorType = Config.behaviorType(config);

    if ('crowi-plus' === behaviorType) {
      const path = '/trash' + getPathFromRequest(req);
      return res.redirect(path);
    }
    // official Crowi behavior for '/trash/*'
    else {
      return actions.deletedPageListShow(req, res);
    }
  }


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
      limit : limit
    };
    var queryOptions = {
      offset: offset,
      limit : limit + 1,
      isPopulateRevisionBody: Config.isEnabledTimeline(config),
    };

    var renderVars = {
      page: null,
      path: path,
      pages: [],
      tree: [],
    };

    Page.hasPortalPage(path, req.user, req.query.revision)
    .then(function(portalPage) {
      renderVars.page = portalPage;
      renderVars.revision = portalPage.revision;

      if (portalPage) {
        return Revision.findRevisionList(portalPage.path, {});
      } else {
        return Promise.resolve([]);
      }
    }).then(function(tree) {
      renderVars.tree = tree;

      return Page.findListByStartWith(path, req.user, queryOptions);
    }).then(function(pageList) {

      if (pageList.length > limit) {
        pageList.pop();
      }

      pagerOptions.length = pageList.length;

      renderVars.viewConfig = {
        seener_threshold: SEENER_THRESHOLD,
      };
      renderVars.pager = generatePager(pagerOptions);
      renderVars.pages = pageList;
      res.render('customlayout-selector/page_list', renderVars);
    }).catch(function(err) {
      debug('Error on rendering pageListShow', err);
    });
  };

  actions.pageListShowForCrowiPlus = function(req, res) {
    var path = getPathFromRequest(req);
    // omit the slash of the last
    path = path.replace((/\/$/), '');
    // redirect
    return res.redirect(path);
  }

  actions.pageShowForCrowiPlus = function(req, res) {
    var path = getPathFromRequest(req);

    var limit = 50;
    var offset = parseInt(req.query.offset)  || 0;
    var SEENER_THRESHOLD = 10;

    // index page
    var pagerOptions = {
      offset: offset,
      limit : limit
    };
    var queryOptions = {
      offset: offset,
      limit : limit + 1,
      isPopulateRevisionBody: Config.isEnabledTimeline(config),
      includeDeletedPage: path.startsWith('/trash/'),
    };

    var renderVars = {
      path: path,
      page: null,
      revision: {},
      author: false,
      pages: [],
      tree: [],
    };

    var pageTeamplate = 'customlayout-selector/page';

    var isRedirect = false;
    Page.findPage(path, req.user, req.query.revision)
    .then(function(page) {
      debug('Page found', page._id, page.path);

      // redirect
      if (page.redirectTo) {
        debug(`Redirect to '${page.redirectTo}'`);
        isRedirect = true;
        return res.redirect(encodeURI(page.redirectTo + '?redirectFrom=' + page.path));
      }

      renderVars.page = page;

      if (page) {
        renderVars.path = page.path;
        renderVars.revision = page.revision;
        renderVars.author = page.revision.author;

        return Revision.findRevisionList(page.path, {})
        .then(function(tree) {
          renderVars.tree = tree;
          return Promise.resolve();
        }).then(function() {
          var userPage = isUserPage(page.path);
          var userData = null;

          if (userPage) {
            // change template
            pageTeamplate = 'customlayout-selector/user_page';

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
          else {
            return Promise.resolve();
          }
        });
      } else {
        return Promise.resolve();
      }
    })
    // page not exists
    .catch(function(err) {
      debug('Page not found', path);
      // change template
      pageTeamplate = 'customlayout-selector/not_found';
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
          renderVars.pages = pageList;

          return Promise.resolve();
        })
        .then(function() {
          return interceptorManager.process('beforeRenderPage', req, res, renderVars);
        })
        .then(function() {
          res.render(req.query.presentation ? 'page_presentation' : pageTeamplate, renderVars);
        })
        .catch(function(err) {
          console.log(err);
          debug('Error on rendering pageListShowForCrowiPlus', err);
        });
      }
    });
  }

  actions.deletedPageListShow = function(req, res) {
    var path = '/trash' + getPathFromRequest(req);
    var limit = 50;
    var offset = parseInt(req.query.offset)  || 0;

    // index page
    var pagerOptions = {
      offset: offset,
      limit : limit
    };
    var queryOptions = {
      offset: offset,
      limit : limit + 1,
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
      renderVars.pages = pageList;
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
        pages: pages,
        pager: generatePager({offset: 0, limit: 50})
      });
    }).catch(function(err) {
      debug('search error', err);
    });
  };

  function renderPage(pageData, req, res) {
    // create page
    if (!pageData) {
      return res.render('page', {
        author: {},
        page: false,
      });
    }

    if (pageData.redirectTo) {
      return res.redirect(encodeURI(pageData.redirectTo + '?redirectFrom=' + pageData.path));
    }

    var renderVars = {
      path: pageData.path,
      page: pageData,
      revision: pageData.revision || {},
      author: pageData.revision.author || false,
    };
    var userPage = isUserPage(pageData.path);
    var userData = null;

    Revision.findRevisionList(pageData.path, {})
    .then(function(tree) {
      renderVars.tree = tree;

      return Promise.resolve();
    }).then(function() {
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
      } else {
        return Promise.resolve();
      }
    }).then(function() {
      return interceptorManager.process('beforeRenderPage', req, res, renderVars);
    }).then(function() {
      var defaultPageTeamplate = 'customlayout-selector/page';
      if (userData) {
        defaultPageTeamplate = 'customlayout-selector/user_page';
      }
      res.render(req.query.presentation ? 'page_presentation' : defaultPageTeamplate, renderVars);
    }).catch(function(err) {
      debug('Error: renderPage()', err);
      if (err) {
        res.redirect('/');
      }
    });
  }

  actions.pageShow = function(req, res) {
    var path = path || getPathFromRequest(req);
    var options = {};

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
    }).catch(function(err) {

      const normalizedPath = Page.normalizePath(path);
      if (normalizedPath !== path) {
        return res.redirect(normalizedPath);
      }

      // pageShow は /* にマッチしてる最後の砦なので、creatableName でない routing は
      // これ以前に定義されているはずなので、こうしてしまって問題ない。
      if (!Page.isCreatableName(path)) {
        // 削除済みページの場合 /trash 以下に移動しているので creatableName になっていないので、表示を許可
        debug('Page is not creatable name.', path);
        res.redirect('/');
        return ;
      }
      if (req.query.revision) {
        return res.redirect(encodeURI(path));
      }

      if (isMarkdown) {
        return res.redirect('/');
      }

      Page.hasPortalPage(path + '/', req.user)
      .then(function(page) {
        if (page) {
          return res.redirect(encodeURI(path) + '/');
        } else {

          var fixed = Page.fixToCreatableName(path)
          if (fixed !== path) {
            debug('fixed page name', fixed)
            res.redirect(encodeURI(fixed));
            return ;
          }

          // if guest user
          if (!req.user) {
            res.redirect('/');
          }

          // render editor
          debug('Catch pageShow', err);
          return renderPage(null, req, res);
        }
      }).catch(function(err) {
        debug('Error on rendering pageShow (redirect to portal)', err);
      });
    });
  };

  actions.pageEdit = function(req, res) {

    var pageForm = req.body.pageForm;
    var body = pageForm.body;
    var currentRevision = pageForm.currentRevision;
    var grant = pageForm.grant;
    var path = pageForm.path;

    // TODO: make it pluggable
    var notify = pageForm.notify || {};

    debug('notify: ', notify);

    var redirectPath = encodeURI(path);
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

      if (!req.form.isValid) {
        debug('Form data not valid');
        throw new Error('Form data not valid.');
      }

      if (data && !data.isUpdatable(currentRevision)) {
        debug('Conflict occured');
        req.form.errors.push('page_edit.notice.conflict');
        throw new Error('Conflict.');
      }

      if (data) {
        previousRevision = data.revision;
        return Page.updatePage(data, body, req.user, {grant: grant});
      } else {
        // new page
        updateOrCreate = 'create';
        return Page.create(path, body, req.user, {grant: grant});
      }
    }).then(function(data) {
      // data is a saved page data.
      pageData = data;
      if (!data) {
        throw new Error('Data not found');
      }
      // TODO: move to events
      if (notify.slack) {
        if (notify.slack.on && notify.slack.channel) {
          data.updateSlackChannel(notify.slack.channel).then(function(){}).catch(function(){});

          if (crowi.slack) {
            notify.slack.channel.split(',').map(function(chan) {
              var message = crowi.slack.prepareSlackMessage(pageData, req.user, chan, updateOrCreate, previousRevision);
              crowi.slack.post(message.channel, message.text, message).then(function(){}).catch(function(){});
            });
          }
        }
      }

      return res.redirect(redirectPath);
    }).catch(function(err) {
      debug('Page create or edit error.', err);
      if (pageData && !req.form.isValid) {
        return renderPage(pageData, req, res);
      }

      return res.redirect(redirectPath);
    });
  };

  // app.get( '/users/:username([^/]+)/bookmarks'      , loginRequired(crowi, app) , page.userBookmarkList);
  actions.userBookmarkList = function(req, res) {
    var username = req.params.username;
    var limit = 50;
    var offset = parseInt(req.query.offset)  || 0;

    var user;
    var renderVars = {};

    var pagerOptions = { offset: offset, limit : limit };
    var queryOptions = { offset: offset, limit : limit + 1, populatePage: true, requestUser: req.user};

    User.findUserByUsername(username)
    .then(function(user) {
      if (user === null) {
        throw new Error('The user not found.');
      }
      renderVars.pageUser = user;

      return Bookmark.findByUser(user, queryOptions);
    }).then(function(bookmarks) {

      if (bookmarks.length > limit) {
        bookmarks.pop();
      }
      pagerOptions.length = bookmarks.length;

      renderVars.pager = generatePager(pagerOptions);
      renderVars.bookmarks = bookmarks;

      return res.render('user/bookmarks', renderVars);
    }).catch(function(err) {
      debug('Error on rendereing bookmark', err);
      res.redirect('/');
    });
  };

  // app.get( '/users/:username([^/]+)/recent-create' , loginRequired(crowi, app) , page.userRecentCreatedList);
  actions.userRecentCreatedList = function(req, res) {
    var username = req.params.username;
    var limit = 50;
    var offset = parseInt(req.query.offset) || 0;

    var user;
    var renderVars = {};

    var pagerOptions = { offset: offset, limit : limit };
    var queryOptions = { offset: offset, limit : limit + 1};


    User.findUserByUsername(username)
    .then(function(user) {
      if (user === null) {
        throw new Error('The user not found.');
      }
      renderVars.pageUser = user;

      return Page.findListByCreator(user, queryOptions, req.user);
    }).then(function(pages) {

      if (pages.length > limit) {
        pages.pop();
      }
      pagerOptions.length = pages.length;

      renderVars.pager = generatePager(pagerOptions);
      renderVars.pages = pages;

      return res.render('user/recent-create', renderVars);
    }).catch(function(err) {
      debug('Error on rendereing recent-created', err);
      res.redirect('/');
    });
  };

  var api = actions.api = {};

  /**
   * redirector
   */
  api.redirector = function(req, res){
    var id = req.params.id;

    Page.findPageById(id)
    .then(function(pageData) {

      if (pageData.grant == Page.GRANT_RESTRICTED && !pageData.isGrantedFor(req.user)) {
        return Page.pushToGrantedUsers(pageData, req.user);
      }

      return Promise.resolve(pageData);
    }).then(function(page) {

      return res.redirect(encodeURI(page.path));
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

    var pagerOptions = { offset: offset, limit : limit };
    var queryOptions = { offset: offset, limit : limit + 1};

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
    } else {
      pageFetcher = Page.findListByStartWith(path, req.user, queryOptions);
    }

    pageFetcher
    .then(function(pages) {
      if (pages.length > limit) {
        pages.pop();
      }
      pagerOptions.length = pages.length;

      var result = {};
      result.pages = pages;
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
  api.create = function(req, res){
    var body = req.body.body || null;
    var pagePath = req.body.path || null;
    var grant = req.body.grant || null;

    if (body === null || pagePath === null) {
      return res.json(ApiResponse.error('Parameters body and path are required.'));
    }

    var ignoreNotFound = true;
    Page.findPage(pagePath, req.user, null, ignoreNotFound)
    .then(function(data) {
      if (data !== null) {
        throw new Error('Page exists');
      }

      return Page.create(pagePath, body, req.user, {grant: grant});
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
    });;

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
  api.update = function(req, res){
    var pageBody = req.body.body || null;
    var pageId = req.body.page_id || null;
    var revisionId = req.body.revision_id || null;
    var grant = req.body.grant || null;

    if (pageId === null || pageBody === null) {
      return res.json(ApiResponse.error('page_id and body are required.'));
    }

    Page.findPageByIdAndGrantedUser(pageId, req.user)
    .then(function(pageData) {
      if (pageData && revisionId !== null && !pageData.isUpdatable(revisionId)) {
        throw new Error('Revision error.');
      };

      var grantOption = {grant: pageData.grant};
      if (grant !== null) {
        grantOption.grant = grant;
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
  api.get = function(req, res){
    const pagePath = req.query.path || null;
    const pageId = req.query.page_id || null; // TODO: handling
    const revisionId = req.query.revision_id || null;

    if (!pageId && !pagePath) {
      return res.json(ApiResponse.error(new Error('Parameter path or page_id is required.')));
    }

    let pageFinder;
    if (pageId) { // prioritized
      pageFinder = Page.findPageByIdAndGrantedUser(pageId, req.user);
    } else if (pagePath) {
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
  api.seen = function(req, res){
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
  api.like = function(req, res){
    var id = req.body.page_id;

    Page.findPageByIdAndGrantedUser(id, req.user)
    .then(function(pageData) {
      return pageData.like(req.user);
    }).then(function(data) {
      var result = {page: data};
      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
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
  api.unlike = function(req, res){
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
  api.remove = function(req, res){
    var pageId = req.body.page_id;
    var previousRevision = req.body.revision_id || null;

    // get completely flag
    const isCompletely = (req.body.completely !== undefined);
    // get recursively flag
    const isRecursively = (req.body.recursively !== undefined);

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
    }).then(function(data) {
      debug('Page deleted', data.path);
      var result = {};
      result.page = data;

      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
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
  api.revertRemove = function(req, res){
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
  api.rename = function(req, res){
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
      // if page found, cannot cannot rename to that path
      return res.json(ApiResponse.error(`このページ名は作成できません (${newPagePath})。ページが存在します。`));
    }).catch(function(err) {

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

      }).then(function() {
        var result = {};
        result.page = page;

        return res.json(ApiResponse.success(result));
      }).catch(function(err) {
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
  api.duplicate = function (req, res) {
    var pageId = req.body.page_id;
    var newPagePath = Page.normalizePath(req.body.new_path);
    var page = {};

    Page.findPageById(pageId)
      .then(function (pageData) {
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
  api.unlink = function(req, res){
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
