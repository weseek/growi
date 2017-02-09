module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('crowi:routes:installer')
    , models = crowi.models
    , Config = models.Config
    , User = models.User

    , actions = {};

  actions.index = function(req, res) {
    return res.render('installer');
  };

  actions.createAdmin = function(req, res) {
    var registerForm = req.body.registerForm || {};
    var language = req.language || 'en';

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

            // login処理
            req.user = req.session.user = userData;
            req.flash('successMessage', 'Crowi のインストールが完了しました！はじめに、このページでこの Wiki の各種設定を確認してください。');
            return res.redirect('/admin/app');
          });
        });
      });
    } else {
      return res.render('installer');
    }
  };

  return actions;
};
