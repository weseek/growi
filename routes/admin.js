module.exports = function(app) {
  'use strict';

  var debug = require('debug')('crowi:routes:admin')
    , models = app.set('models')
    , Page = models.Page
    , User = models.User
    , Config = models.Config

    , MAX_PAGE_LIST = 5
    , actions = {};

  function createPager(currentPage, pageCount, itemCount, maxPageList) {
    var pager = {};
    pager.currentPage = currentPage;
    pager.pageCount = pageCount;
    pager.itemCount = itemCount;

    pager.previous = null;
    if (currentPage > 1) {
      pager.previous = currentPage - 1;
    }

    pager.next = null;
    if (currentPage < pageCount) {
      pager.next = currentPage + 1;
    }

    pager.pages = [];
    var pagerMin = Math.max(1, Math.ceil(currentPage - maxPageList/2));
    var pagerMax = Math.min(pageCount, Math.floor(currentPage + maxPageList/2));
    if (pagerMin == 1) {
      if (MAX_PAGE_LIST < pageCount) {
        pagerMax = MAX_PAGE_LIST;
      } else {
        pagerMax = pageCount;
      }
    }
    if (pagerMax == pageCount) {
      if ((pagerMax - MAX_PAGE_LIST) < 1) {
        pagerMin = 1;
      } else {
        pagerMin = pagerMax - MAX_PAGE_LIST;
      }
    }

    pager.previousDots = null;
    if (pagerMin > 1) {
      pager.previousDots = true;
    }

    pager.nextDots = null;
    if (pagerMax < pageCount) {
      pager.nextDots = true;
    }

    for (var i = pagerMin;
      i <= pagerMax;
      i++) {
      pager.pages.push(i);
    }

    return pager;
  }

  actions.index = function(req, res) {
    return res.render('admin/index');
  };

  actions.app = {};
  actions.app.index = function(req, res) {
    var settingForm;
    settingForm = Config.setupCofigFormData('crowi', req.config);

    debug('settingForm', settingForm);
    return res.render('admin/app', {
      settingForm: settingForm,
    });
  };

  actions.app.settingUpdate = function(req, res) {
  };

  actions.user = {};
  actions.user.index = function(req, res) {
    var page = parseInt(req.query.page) || 0;

    User.findUsersWithPagination({page: page}, function(err, users, pageCount, itemCount) {
      var pager = createPager(page, pageCount, itemCount, MAX_PAGE_LIST);
      return res.render('admin/users', {
        users: users,
        pager: pager
      });
    });
  };

  actions.user.makeAdmin = function(req, res) {
    var id = req.params.id;
    User.findById(id, function(err, userData) {
      userData.makeAdmin(function(err, userData) {
        if (err === null) {
          req.flash('successMessage', userData.name + 'さんのアカウントを管理者に設定しました。');
        } else {
          req.flash('errorMessage', '更新に失敗しました。');
          debug(err, userData);
        }
        return res.redirect('/admin/users');
      });
    });
  };

  actions.user.removeFromAdmin = function(req, res) {
    var id = req.params.id;
    User.findById(id, function(err, userData) {
      userData.removeFromAdmin(function(err, userData) {
        if (err === null) {
          req.flash('successMessage', userData.name + 'さんのアカウントを管理者から外しました。');
        } else {
          req.flash('errorMessage', '更新に失敗しました。');
          debug(err, userData);
        }
        return res.redirect('/admin/users');
      });
    });
  };

  actions.user.activate = function(req, res) {
    var id = req.params.id;
    User.findById(id, function(err, userData) {
      userData.statusActivate(function(err, userData) {
        if (err === null) {
          req.flash('successMessage', userData.name + 'さんのアカウントを承認しました');
        } else {
          req.flash('errorMessage', '更新に失敗しました。');
          debug(err, userData);
        }
        return res.redirect('/admin/users');
      });
    });
  };

  actions.user.suspend = function(req, res) {
    var id = req.params.id;

    User.findById(id, function(err, userData) {
      userData.statusSuspend(function(err, userData) {
        if (err === null) {
          req.flash('successMessage', userData.name + 'さんのアカウントを利用停止にしました');
        } else {
          req.flash('errorMessage', '更新に失敗しました。');
          debug(err, userData);
        }
        return res.redirect('/admin/users');
      });
    });
  };

  actions.api = {};
  actions.api.appSetting = function(req, res) {
    var form = req.body.settingForm;

    if (req.form.isValid) {
      Config.updateNamespaceByArray('crowi', form, function(err, config) {
        Config.updateConfigCache('crowi', config)
        return res.json({status: true});
      });
    } else {
      return res.json({status: false, message: req.form.errors.join('\n')});
    }
  };


  return actions;
};

