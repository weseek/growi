module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('growi:routes:installer')
    , path = require('path')
    , fs = require('graceful-fs')
    , models = crowi.models
    , Config = models.Config
    , User = models.User
    , Page = models.Page

    , actions = {};

  function createInitialPages(owner, lang) {
    // create portal page for '/'
    const welcomeMarkdownPath = path.join(crowi.localeDir, lang, 'welcome.md');
    const welcomeMarkdown = fs.readFileSync(welcomeMarkdownPath);
    Page.create('/', welcomeMarkdown, owner, {});

    // create /Sandbox
    const sandboxMarkdownPath = path.join(crowi.localeDir, lang, 'sandbox.md');
    const sandboxMarkdown = fs.readFileSync(sandboxMarkdownPath);
    Page.create('/Sandbox', sandboxMarkdown, owner, {});

    // create /Sandbox/Bootstrap3
    const bs3MarkdownPath = path.join(crowi.localeDir, 'en-US', 'sandbox-bootstrap3.md');
    const bs3Markdown = fs.readFileSync(bs3MarkdownPath);
    Page.create('/Sandbox/Bootstrap3', bs3Markdown, owner, {});
  }

  actions.index = function(req, res) {
    return res.render('installer');
  };

  actions.createAdmin = function(req, res) {
    var registerForm = req.body.registerForm || {};
    var language = req.language || 'Config.globalLang(config)';

    if (req.form.isValid) {
      var name = registerForm.name;
      var username = registerForm.username;
      var email = registerForm.email;
      var password = registerForm.password;

      User.createUserByEmailAndPassword(name, username, email, password, language, function(err, userData) {
        if (err) {
          req.form.errors.push('管理ユーザーの作成に失敗しました。' + err.message);
          // TODO
          return res.render('installer');
        }

        userData.makeAdmin(function(err, userData) {
          Config.applicationInstall(function(err, configs) {
            if (err) {
              // TODO
              return ;
            }

            // login with passport
            req.logIn(userData, (err) => {
              if (err) { return next() }
              else {
                req.flash('successMessage', 'GROWI のインストールが完了しました！はじめに、このページで各種設定を確認してください。');
                return res.redirect('/admin/app');
              }
            });
          });

          // create initial pages
          createInitialPages(userData, language);
        });
      });
    }
    else {
      return res.render('installer');
    }
  };

  return actions;
};
