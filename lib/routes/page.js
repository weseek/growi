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
    var next = null, prev = null,
        offset = parseInt(options.offset, 10),
        limit  = parseInt(options.limit, 10);

    if (offset > 0) {
      prev = offset - limit;
      if (prev < 0) {
        prev = 0;
      }
    }

    next = offset + limit;

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
    var options = {};

    // index page
    options = {
      offset: req.query.offset || 0,
      limit : req.query.limit  || 50
    };
    var q = Page.findListByStartWith(path, req.user, options, function(err, doc) {
      if (err) {
        // TODO : check
      }
      res.render('page_list', {
        path: path + (path == '/' ? '' : '/'),
        pages: doc,
        pager: generatePager(options)
      });
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
    options = {
    };

    Page.findPage(path, req.user, req.query.revision, options, function(err, pageData) {
      if (req.query.revision && err) {
        res.redirect(encodeURI(path));
        return ;
      }

      if (err == Page.PAGE_GRANT_ERROR) {
        debug('PAGE_GRANT_ERROR');
        return res.redirect('/');
      }

      if (pageData) {
        debug('Page found', pageData._id, pageData.path);
        pageData.seen(req.user, function(err, data) {
          return renderPage(data, req, res);
        });
      } else {
          return renderPage(null, req, res);
      }
    });
  };

  actions.pageEdit = function(req, res) {
    var io = module.parent.exports.io;
    var path = getPathFromRequest(req);

    var pageForm = req.body.pageForm;
    var body = pageForm.body;
    var format = pageForm.format;
    var currentRevision = pageForm.currentRevision;
    var grant = pageForm.grant;

    if (!Page.isCreatableName(path)) {
      res.redirect(encodeURI(path));
      return ;
    }

    Page.findPage(path, req.user, null, {}, function(err, pageData){
      if (!req.form.isValid) {
        renderPage(pageData, req, res);
        return;
      }
      if (pageData && !pageData.isUpdatable(currentRevision)) {
        req.form.errors.push('すでに他の人がこのページを編集していたため保存できませんでした。ページを再読み込み後、自分の編集箇所のみ再度編集してください。');
        renderPage(pageData, req, res);
        return;
      }

      var cb = function(err, data) {
        if (err) {
          console.log('Page save error:', err);
        }
        crowi.getIo().sockets.emit('page edited', {page: data, user: req.user});

        var redirectPath = encodeURI(path);
        if (grant != data.grant) {
          Page.updateGrant(data, grant, req.user, function (err, data) {
            return res.redirect(redirectPath);
          });
        } else {
          return res.redirect(redirectPath);
        }
      };
      if (pageData) {
        var newRevision = Revision.prepareRevision(pageData, body, req.user);
        Page.pushRevision(pageData, newRevision, req.user, cb);
      } else {
        Page.create(path, body, req.user, {format: format, grant: grant}, cb);
      }
    });
  };

  var api = actions.api = {};

  /**
   * redirector
   */
  api.redirector = function(req, res){
    var id = req.params.id;

    var cb = function(err, d) {
      if (err) {
        return res.redirect('/');
      }
      return res.redirect(encodeURI(d.path));
    };

    Page.findPageById(id, function(err, pageData) {
      if (pageData) {
        if (pageData.grant == Page.GRANT_RESTRICTED && !pageData.isGrantedFor(req.user)) {
          return Page.pushToGrantedUsers(pageData, req.user, cb);
        } else {
          return cb(null, pageData);
        }
      } else {
        // 共有用URLにrevisionのidを使っていた頃の互換性のため
        Revision.findRevision(id, cb);
      }
    });
  };

  /**
   * @api pages.get
   * @param page /page/path
   * @param page_id XXXXX
   */
  api.get = function(req, res){
    var pagePath = req.query.page;
    var revision = req.query.revision;
    var options = {};

    Page.findPage(pagePath, req.user, revision, options, function(err, pageData) {
      var result = {};
      if (err) {
        result = ApiResponse.error(err);
      }
      if (pageData) {
        result = ApiResponse.success(pageData);
      }

      return res.json(result);
    });
  };

  /**
   * page like
   */
  api.like = function(req, res){
    var id = req.params.id;
    Page.findPageByIdAndGrantedUser(id, req.user, function(err, pageData) {
      if (pageData) {
        pageData.like(req.user, function(err, data) {
          return res.json({status: true});
        });
      } else {
        return res.json({status: false});
      }
    });
  };

  /**
   * page like
   */
  api.unlike = function(req, res){
    var id = req.params.id;

    Page.findPageByIdAndGrantedUser(id, req.user, function(err, pageData) {
      if (pageData) {
        pageData.unlike(req.user, function(err, data) {
          return res.json({status: true});
        });
      } else {
        return res.json({status: false});
      }
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
