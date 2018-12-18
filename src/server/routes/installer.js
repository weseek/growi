module.exports = function(crowi, app) {
  'use strict';

  const logger = require('@alias/logger')('growi:routes:installer');
  const path = require('path');
  const fs = require('graceful-fs');
  const models = crowi.models;
  const Config = models.Config;
  const User = models.User;
  const Page = models.Page;

  const actions = {};

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

  actions.createAdmin = function(req, res, next) {
    const registerForm = req.body.registerForm || {};

    if (!req.form.isValid) {
      return res.render('installer');
    }

    const name = registerForm.name;
    const username = registerForm.username;
    const email = registerForm.email;
    const password = registerForm.password;
    const language = registerForm['app:globalLang'] || 'en-US';

    User.createUserByEmailAndPassword(name, username, email, password, language, function(err, userData) {
      if (err) {
        req.form.errors.push('管理ユーザーの作成に失敗しました。' + err.message);
        // TODO
        return res.render('installer');
      }

      userData.makeAdmin(function(err, userData) {
        Config.applicationInstall(function(err, configs) {
          if (err) {
            logger.error(err);
            return;
          }

          // save the globalLang config, and update the config cache
          Config.updateNamespaceByArray('crowi', {'app:globalLang': language}, function(err, config) {
            Config.updateConfigCache('crowi', config);
          });

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
  };

  return actions;
};
