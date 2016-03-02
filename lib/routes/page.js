module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('crowi:routes:page')
    , Page = crowi.model('Page')
    , User = crowi.model('User')
    , Revision = crowi.model('Revision')
    , Bookmark = crowi.model('Bookmark')
    , ApiResponse = require('../util/apiResponse')
    , actions = {};

  function getPathFromRequest(req) {
    var path = '/' + (req.params[0] || '');
    return path;
  }

  function isUserPage(path) {
    if (path.match(/^\/user\/[^\/]+$/)) {
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
      limit: limit
    };
  }

  // routing
  actions.pageListShow = function(req, res) {
    var path = getPathFromRequest(req);
    var limit = parseInt(req.query.limit)  || 50;
    var offset = parseInt(req.query.offset)  || 0;
    path = path + (path == '/' ? '' : '/');

    // index page
    var pagerOptions = {
      offset: offset,
      limit : limit
    };
    var queryOptions = {
      offset: offset,
      limit : limit + 1
    };

    var renderVars = {
      page: null,
      path: path,
      pages: [],
    };

    Page.hasPortalPage(path, req.user)
    .then(function(portalPage) {
      renderVars.page = portalPage;

      return Page.findListByStartWith(path.substr(0, path.length -1), req.user, queryOptions);
    }).then(function(pageList) {

      if (pageList.length > limit) {
        pageList.pop();
      }

      pagerOptions.length = pageList.length;

      renderVars.pager = generatePager(pagerOptions);
      renderVars.pages = pageList;
      res.render('page_list', renderVars);
    });
  };

  function renderPage(pageData, req, res) {
    // create page
    if (!pageData) {
      return res.render('page', {
        revision: {},
        author: {},
        page: false,
      });
    }

    if (pageData.redirectTo) {
      return res.redirect(encodeURI(pageData.redirectTo + '?renamed=' + pageData.path));
    }

    Revision.findRevisionList(pageData.path, {}, function(err, tree) {
      var revision = pageData.revision || {};
      var defaultPageTeamplate = 'page';
      if (isUserPage(pageData.path)) {
        defaultPageTeamplate = 'user_page';
      }

      res.render(req.query.presentation ? 'page_presentation' : defaultPageTeamplate, {
        path: pageData.path,
        revision: revision,
        author: revision.author || false,
        page: pageData,
        tree: tree || [],
      });
    });
  }

  actions.pageShow = function(req, res) {
    var path = path || getPathFromRequest(req);
    var options = {};

    res.locals.path = path;

    // pageShow は /* にマッチしてる最後の砦なので、creatableName でない routing は
    // これ以前に定義されているはずなので、こうしてしまって問題ない。
    if (!Page.isCreatableName(path)) {
      debug('Page is not creatable name.', path);
      res.redirect('/');
      return ;
    }

    // single page
    var parentPath = path.split('/').slice(0, -1).join('/'); // TODO : limitation

    Page.findPage(path, req.user, req.query.revision)
    .then(function(page) {
      debug('Page found', page._id, page.path);

      return renderPage(page, req, res);
    }).catch(function(err) {
      if (req.query.revision) {
        return res.redirect(encodeURI(path));
      }

      debug('Catch pageShow', err);
      return renderPage(null, req, res);
    });
  };

  actions.pageEdit = function(req, res) {

    var pageForm = req.body.pageForm;
    var body = pageForm.body;
    var currentRevision = pageForm.currentRevision;
    var grant = pageForm.grant;
    var path = pageForm.path;

    var redirectPath = encodeURI(path);

    // set to render
    res.locals.pageForm = pageForm;

    if (!Page.isCreatableName(path)) {
      res.redirect(redirectPath);
      return ;
    }

    var ignoreNotFound = true;
    Page.findPage(path, req.user, null, ignoreNotFound)
    .then(function(pageData) {
      if (!req.form.isValid) {
        renderPage(pageData, req, res);
        return Promise.reject(new Error('form error'));
      }

      if (pageData && !pageData.isUpdatable(currentRevision)) {
        req.form.errors.push('すでに他の人がこのページを編集していたため保存できませんでした。ページを再読み込み後、自分の編集箇所のみ再度編集してください。');
        renderPage(pageData, req, res);
        return Promise.reject(new Error('form error'));
      }

      if (pageData) {
        // update existing page
        var newRevision = Revision.prepareRevision(pageData, body, req.user);
        return Page.pushRevision(pageData, newRevision, req.user);
      } else {
        // new page
        return Page.create(path, body, req.user, {grant: grant});
      }
    }).then(function(data) {
      crowi.getIo().sockets.emit('page edited', {page: data, user: req.user});

      if (grant != data.grant) {
        return Page.updateGrant(data, grant, req.user).then(function(data) {
          return res.redirect(redirectPath);
        });
      } else {
        return res.redirect(redirectPath);
      }
    }).catch(function(err) {
      debug('Create or edit page error', err);
      return res.redirect(redirectPath);
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
   * @api {get} /pages.get Post comment for the page
   * @apiName GetPage
   * @apiGroup Page
   *
   * @apiParam {String} page_id
   * @apiParam {String} path
   * @apiParam {String} revision_id
   */
  api.get = function(req, res){
    var pagePath = req.query.path || null;
    var pageId = req.query.page_id || null; // TODO: handling
    var revisionId = req.query.revision_id || null;

    Page.findPage(pagePath, req.user, revisionId)
    .then(function(pageData) {
      var result = {};
      result.page = pageData;

      return res.json(ApiResponse.success(pageData));
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
   * page rename
   */
  api.rename = function(req, res){
    var path = Page.normalizePath(getPathFromRequest(req));

    var val = req.body;
    var previousRevision = val.previousRevision;
    var newPageName = Page.normalizePath(val.newPageName);
    var options = {
      createRedirectPage: val.createRedirectPage || 0,
      moveUnderTrees: val.moveUnderTrees || 0,
    };

    if (!Page.isCreatableName(newPageName)) {
      return res.json({
        message: 'このページ名は作成できません (' + newPageName + ')',
        status: false,
      });
    }
    Page.findPage(newPageName, req.user, null, {}, function(err, checkPageData){
      if (checkPageData) {
        return res.json({
          message: 'このページ名は作成できません (' + newPageName + ')。ページが存在します。',
          status: false,
        });
      }

      Page.findPage(path, req.user, null, {}, function(err, pageData){
        if (!pageData.isUpdatable(previousRevision)) {
          return res.json({
            message: '誰かが更新している可能性があります。ページを更新できません。',
            status: false,
          });
        }
        if (err) {
          return res.json({
            message: 'エラーが発生しました。ページを更新できません。',
            status: false,
          });
        }

        Page.rename(pageData, newPageName, req.user, options, function(err, pageData) {
          if (err) {
            return res.json({
              message: 'ページの移動に失敗しました',
              status: false,
            });
          }

          return res.json({
            message: '移動しました',
            page: pageData,
            status: true,
          });
        });
      });
    });
  };

  return actions;
};
