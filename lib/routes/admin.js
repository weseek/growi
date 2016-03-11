module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('crowi:routes:admin')
    , models = crowi.models
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
    var page = parseInt(req.query.page) || 1;

    User.findUsersWithPagination({page: page}, function(err, users, pageCount, itemCount) {
      var pager = createPager(page, pageCount, itemCount, MAX_PAGE_LIST);
      return res.render('admin/users', {
        users: users,
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

  actions.user.remove= function(req, res) {
    // 未実装
    return res.redirect('/admin/users');
  };

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

  actions.slackauthstart = function(req, res) {
    var Botkit = require('botkit');
    var controller = Botkit.slackbot();
    controller.configureSlackApp({
      clientId: '',
      clientSecret: '',
      redirectUri: 'http://localhost:3000/slackauth',
      scopes: ['chat:write:bot']
    });

    return res.render('admin/slackauthstart', {
      url: controller.getAuthorizeURL(),
    });
  };

  actions.slackauth = function(req, res) {
    debug(req.query.code);
    var Botkit = require('botkit');
    var controller = Botkit.slackbot({debug: true});
    controller.configureSlackApp({
      clientId: '',
      clientSecret: '',
      redirectUri: 'http://localhost:3000/slackauth',
      scopes: ['chat:write:bot']
    });

    var bot = controller.spawn();
    bot.api.oauth.access({code: req.query.code}, function (err, response) {
      debug(err, response);
    });
    //
    // access_token: '',
    // scope: 'identify,chat:write:bot',
    // team_name: '',
    // team_id: '' }
    //var bot = controller.spawn({token: ''});
    //bot.api.chat.postMessage({
    //  channel: '#xtest',
    //  username: 'Crowi',
    //  text: '/hoge/fuga/piyo is updated.',
    //  attachments: [
    //    {
    //      color: '#263a3c',
    //      author_name: '@sotarok',
    //      author_link: 'http://localhost:3000/user/sotarok',
    //      author_icon: 'https://crowi-strk-dev.s3.amazonaws.com/user/56c9dbf860ab5bc62647d84a.png',
    //      title: "/hoge/fuga/piyo",
    //      title_link: "http://localhost:3000/hoge/fuga/piyo",
    //      text: '*# sotarok*\n\nshellに続き、初心者が頑張って理解していくノート的記事です。\nGitHubが常識と化してきた今日この頃、チャレンジしてみたものの、そもそもGitってなんなのかわからないと使いこなせない、っていうか挫折すると思います。私はしました。\nなので、起き上がってまずGitについて本当に一から理解を試みました。\n\n***\n  \n*## Gitって何？*\n\nGitとは、**[バージョン管理システム](https://ja.wikipedia.org/wiki/%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0)**のひとつです。\n        バージョン管理‥？ :open_mouth: \nバージョンすなわち変更履歴の管理です。\n\n例えばなにかファイルの書き換えをするとき、元データを失わないためにどのような工夫をするでしょうか。ほとんどの場合、保存用にコピーを作成しておくというのが定番の方法だと思います。\nですが、誰しもこんな経験があるのでは。\n\n - 元データの保管が面倒\n  - \'meeting_3月.txt\'、\'meeting_最新.txt\'といった名前のデータが複数できてしまう\n   - チームで触っていて、最後に書き換えたのが誰なのかわからない\n    - 先輩も同時に編集していたのに、知らずにタッチの差で上書きしてしまった\n     - 書き換えたよ～と言われても（あるいは自分でも）、どこを換えたかわからない\n      - 何回か前の更新状態の方が良かった、戻したい…\n      \n      ある～～～！！\n      こんな事態を解消してくれるのが**Gitというバージョン管理システム**です。',
    //      mrkdwn_in: ["text"],
    //    },
    //  ],
    //});

    //var code = req.query.);
    res.render('admin/slackauth', {});
  };

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

