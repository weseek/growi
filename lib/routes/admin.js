module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('crowi:routes:admin')
    , models = crowi.models
    , Page = models.Page
    , User = models.User
    , Config = models.Config
    , ApiResponse = require('../util/apiResponse')

    , MAX_PAGE_LIST = 5
    , actions = {};

  function createPager(total, limit, page, pagesCount, maxPageList) {
    const pager = {
      page: page,
      pagesCount: pagesCount,
      pages: [],
      total: total,
      previous: null,
      previousDots: false,
      next: null,
      nextDots: false,
    };

    if (page > 1) {
      pager.previous = page - 1;
    }

    if (page < pagesCount) {
      pager.next = page + 1;
    }

    let pagerMin = Math.max(1, Math.ceil(page - maxPageList/2));
    let pagerMax = Math.min(pagesCount, Math.floor(page + maxPageList/2));
    if (pagerMin === 1) {
      if (MAX_PAGE_LIST < pagesCount) {
        pagerMax = MAX_PAGE_LIST;
      } else {
        pagerMax = pagesCount;
      }
    }
    if (pagerMax === pagesCount) {
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
    if (pagerMax < pagesCount) {
      pager.nextDots = true;
    }

    for (let i = pagerMin; i <= pagerMax; i++) {
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

    return res.render('admin/app', {
      settingForm: settingForm,
    });
  };

  actions.app.settingUpdate = function(req, res) {
  };

  // app.get('/admin/notification'               , admin.notification.index);
  actions.notification = {};
  actions.notification.index = function(req, res) {
    var config = crowi.getConfig();
    var UpdatePost = crowi.model('UpdatePost');
    var slackSetting = Config.setupCofigFormData('notification', config);
    var hasSlackConfig = Config.hasSlackConfig(config);
    var hasSlackToken = Config.hasSlackToken(config);
    var slack = crowi.slack;
    var slackAuthUrl = '';

    if (!Config.hasSlackConfig(req.config)) {
      slackSetting['slack:clientId'] = '';
      slackSetting['slack:clientSecret'] = '';
    } else {
      slackAuthUrl = slack.getAuthorizeURL();
    }

    if (req.session.slackSetting) {
      slackSetting = req.session.slackSetting;
      req.session.slackSetting = null;
    }

    UpdatePost.findAll()
    .then(function(settings) {
      return res.render('admin/notification', {
        settings,
        slackSetting,
        hasSlackConfig,
        hasSlackToken,
        slackAuthUrl
      });
    });
  };

  // app.post('/admin/notification/slackSetting' , admin.notification.slackauth);
  actions.notification.slackSetting = function(req, res) {
    var slackSetting = req.form.slackSetting;

    req.session.slackSetting = slackSetting;
    if (req.form.isValid) {
      Config.updateNamespaceByArray('notification', slackSetting, function(err, config) {
        Config.updateConfigCache('notification', config);
        req.session.slackSetting = null;

        crowi.setupSlack().then(function() {
          return res.redirect('/admin/notification');
        });
      });
    } else {
      req.flash('errorMessage', req.form.errors);
      return res.redirect('/admin/notification');
    }
  };

  // app.get('/admin/notification/slackAuth'     , admin.notification.slackauth);
  actions.notification.slackAuth = function(req, res) {
    var code = req.query.code;
    var config = crowi.getConfig();

    if (!code || !Config.hasSlackConfig(req.config)) {
      return res.redirect('/admin/notification');
    }

    var slack = crowi.slack;
    var bot = slack.createBot();
    bot.api.oauth.access({code}, function(err, data) {
      debug('oauth response', err, data);
      if (!data.ok || !data.access_token) {
        req.flash('errorMessage', ['Failed to fetch access_token. Please do connect again.']);
        return res.redirect('/admin/notification');
      } else {
        Config.updateNamespaceByArray('notification', {'slack:token': data.access_token}, function(err, config) {
          if (err) {
            req.flash('errorMessage', ['Failed to save access_token. Please try again.']);
          } else {
            Config.updateConfigCache('notification', config);
            req.flash('successMessage', ['Successfully Connected!']);
          }

          slack.createBot();
          return res.redirect('/admin/notification');
        });
      }
    });
  };

  actions.search = {};
  actions.search.index = function(req, res) {
    var search = crowi.getSearcher();
    if (!search) {
      return res.redirect('/admin');
    }

    return res.render('admin/search', {
    });
  };

  actions.search.buildIndex = function(req, res) {
    var search = crowi.getSearcher();
    if (!search) {
      return res.redirect('/admin');
    }

    Promise.resolve().then(function() {
      return new Promise(function(resolve, reject) {
        search.deleteIndex()
          .then(function(data) {
            debug('Index deleted.');
            resolve();
          }).catch(function(err) {
            debug('Delete index Error, but if it is initialize, its ok.', err);
            resolve();
          });
      });
    }).then(function() {
      search.buildIndex()
        .then(function(data) {
          if (!data.errors) {
            debug('Index created.');
          }
          return search.addAllPages();
        })
        .then(function(data) {
          if (!data.errors) {
            debug('Data is successfully indexed.');
          } else {
            debug('Data index error.', data.errors);
          }
        })
        .catch(function(err) {
          debug('Error', err);
        });

      req.flash('successMessage', 'Now re-building index ... this takes a while.');
      return res.redirect('/admin/search');
    });
  };

  actions.user = {};
  actions.user.index = function(req, res) {
    var page = parseInt(req.query.page) || 1;

    User.findUsersWithPagination({page: page}, function(err, result) {
      const pager = createPager(result.total, result.limit, result.page, result.pages, MAX_PAGE_LIST);

      return res.render('admin/users', {
        users: result.docs,
        pager: pager
      });
    });
  };

  actions.user.invite = function(req, res) {
    var form = req.form.inviteForm;
    var toSendEmail = form.sendEmail || false;
    if (req.form.isValid) {
      User.createUsersByInvitation(form.emailList.split('\n'), toSendEmail, function(err, userList) {
        if (err) {
          req.flash('errorMessage', req.form.errors.join('\n'));
        } else {
          req.flash('createdUser', userList);
        }
        return res.redirect('/admin/users');
      });
    } else {
      req.flash('errorMessage', req.form.errors.join('\n'));
      return res.redirect('/admin/users');
    }
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

  actions.user.remove = function(req, res) {
    // 未実装
    return res.redirect('/admin/users');
  };

  // これやったときの relation の挙動未確認
  actions.user.removeCompletely = function(req, res) {
    // ユーザーの物理削除
    var id = req.params.id;

    User.removeCompletelyById(id, function(err, removed) {
      if (err) {
        debug('Error while removing user.', err, id);
        req.flash('errorMessage', '完全な削除に失敗しました。');
      } else {
        req.flash('successMessage', '削除しました');
      }
      return res.redirect('/admin/users');
    });
  };

  // app.post('/_api/admin/users.resetPassword' , admin.api.usersResetPassword);
  actions.user.resetPassword = function(req, res) {
    const id = req.body.user_id;
    const User = crowi.model('User');

    User.resetPasswordByRandomString(id)
    .then(function(data) {
      data.user = User.filterToPublicFields(data.user);
      return res.json(ApiResponse.success(data));
    }).catch(function(err) {
      debug('Error on reseting password', err);
      return res.json(ApiResponse.error('Error'));
    });
  }

  actions.api = {};
  actions.api.appSetting = function(req, res) {
    var form = req.form.settingForm;

    if (req.form.isValid) {
      debug('form content', form);

      // mail setting ならここで validation
      if (form['mail:from']) {
        validateMailSetting(req, form, function(err, data) {
          debug('Error validate mail setting: ', err, data);
          if (err) {
            req.form.errors.push('SMTPを利用したテストメール送信に失敗しました。設定をみなおしてください。');
            return res.json({status: false, message: req.form.errors.join('\n')});
          }

          return saveSetting(req, res, form);
        });
      } else {
        return saveSetting(req, res, form);
      }
    } else {
      return res.json({status: false, message: req.form.errors.join('\n')});
    }
  };

  // app.post('/_api/admin/notifications.add'    , admin.api.notificationAdd);
  actions.api.notificationAdd = function(req, res) {
    var UpdatePost = crowi.model('UpdatePost');
    var pathPattern = req.body.pathPattern;
    var channel = req.body.channel;

    debug('notification.add', pathPattern, channel);
    UpdatePost.create(pathPattern, channel, req.user)
    .then(function(doc) {
      debug('Successfully save updatePost', doc);

      // fixme: うーん
      doc.creator = doc.creator._id.toString();
      return res.json(ApiResponse.success({updatePost: doc}));
    }).catch(function(err) {
      debug('Failed to save updatePost', err);
      return res.json(ApiResponse.error());
    });
  };

  // app.post('/_api/admin/notifications.remove' , admin.api.notificationRemove);
  actions.api.notificationRemove = function(req, res) {
    var UpdatePost = crowi.model('UpdatePost');
    var id = req.body.id;

    UpdatePost.remove(id)
    .then(function() {
      debug('Successfully remove updatePost');

      return res.json(ApiResponse.success({}));
    }).catch(function(err) {
      debug('Failed to remove updatePost', err);
      return res.json(ApiResponse.error());
    });
  };

  // app.get('/_api/admin/users.search' , admin.api.userSearch);
  actions.api.usersSearch = function(req, res) {
    const User = crowi.model('User');
    const email =req.query.email;

    User.findUsersByPartOfEmail(email, {})
    .then(users => {
      const result = {
        data: users
      };
      return res.json(ApiResponse.success(result));
    }).catch(err => {
      return res.json(ApiResponse.error());
    });
  };

  function saveSetting(req, res, form)
  {
    Config.updateNamespaceByArray('crowi', form, function(err, config) {
      Config.updateConfigCache('crowi', config);
      return res.json({status: true});
    });
  }

  function validateMailSetting(req, form, callback)
  {
    var mailer = crowi.mailer;
    var option = {
      host: form['mail:smtpHost'],
      port: form['mail:smtpPort'],
    };
    if (form['mail:smtpUser'] && form['mail:smtpPassword']) {
      option.auth = {
        user: form['mail:smtpUser'],
        pass: form['mail:smtpPassword'],
      };
    }
    if (option.port === 465) {
      option.secure = true;
    }

    var smtpClient = mailer.createSMTPClient(option);
    debug('mailer setup for validate SMTP setting', smtpClient);

    smtpClient.sendMail({
      to: req.user.email,
      subject: 'Wiki管理設定のアップデートによるメール通知',
      text: 'このメールは、WikiのSMTP設定のアップデートにより送信されています。'
    }, callback);
  }


  return actions;
};

