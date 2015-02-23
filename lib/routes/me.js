module.exports = function(app) {
  'use strict';

  var debug = require('debug')('crowi:routes:me')
    , fs = require('fs')
    , models = app.set('models')
    , Page = models.Page
    , User = models.User
    , Revision = models.Revision
    , actions = {}
    , api = {};

  actions.api = api;

  api.uploadPicture = function (req, res) {
    var fileUploader = require('../util/fileUploader')(app);
    var tmpFile = req.files.userPicture || null;
    if (!tmpFile) {
      return res.json({
        'status': false,
        'message': 'File type error.'
      });
    }

    var tmpPath = tmpFile.path;
    var filePath = User.createUserPictureFilePath(req.user, tmpFile.name);
    var acceptableFileType = /image\/.+/;

    if (!tmpFile.mimetype.match(acceptableFileType)) {
      return res.json({
        'status': false,
        'message': 'File type error. Only image files is allowed to set as user picture.',
      });
    }

    fileUploader.uploadFile(
      filePath,
      tmpFile.mimetype,
      fs.createReadStream(tmpPath, {
        flags: 'r',
        encoding: null,
        fd: null,
        mode: '0666',
        autoClose: true
      }),
      {},
      function(err, data) {
        if (err) {
          return res.json({
            'status': false,
            'message': 'Error while uploading to ',
          });
        }
        var imageUrl = fileUploader.generateS3FillUrl(filePath);
        req.user.updateImage(imageUrl, function(err, data) {
          fs.unlink(tmpPath, function (err) {
            // エラー自体は無視
            if (err) {
              console.log('Error while deleting tmp file.');
            }
            return res.json({
              'status': true,
              'url': imageUrl,
              'message': '',
            });
          });
        });
      }
    );
  };

  actions.index = function(req, res) {
    var userForm = req.body.userForm;
    var userData = req.user;

    if (req.method == 'POST' && req.form.isValid) {
      var name = userForm.name;
      var email = userForm.email;

      if (!User.isEmailValid(email)) {
        req.form.errors.push('このメールアドレスは登録できません。(ホワイトリストなどを確認してください)');
        return res.render('me/index', {});
      }

      userData.update(name, email, function(err, userData) {
        if (err) {
          for (var e in err.errors) {
            if (err.errors.hasOwnProperty(e)) {
              req.form.errors.push(err.errors[e].message);
            }
          }
          return res.render('me/index', {});
        }

        req.flash('successMessage', '更新しました');
        return res.redirect('/me');
      });
    } else { // method GET
      /// そのうちこのコードはいらなくなるはず
      if (!userData.isEmailSet()) {
        req.flash('warningMessage', 'メールアドレスが設定されている必要があります');
      }

      return res.render('me/index', {
      });
    }
  };

  actions.password = function(req, res) {
    var passwordForm = req.body.mePassword;
    var userData = req.user;

    // パスワードを設定する前に、emailが設定されている必要がある (schemaを途中で変更したため、最初の方の人は登録されていないかもしれないため)
    // そのうちこのコードはいらなくなるはず
    if (!userData.isEmailSet()) {
      return res.redirect('/me');
    }

    if (req.method == 'POST' && req.form.isValid) {
      var newPassword = passwordForm.newPassword;
      var newPasswordConfirm = passwordForm.newPasswordConfirm;
      var oldPassword = passwordForm.oldPassword;

      if (userData.isPasswordSet() && !userData.isPasswordValid(oldPassword)) {
        req.form.errors.push('現在のパスワードが違います。');
        return res.render('me/password', {
        });
      }

      // check password confirm
      if (newPassword != newPasswordConfirm) {
        req.form.errors.push('確認用パスワードが一致しません');
      } else {
        userData.updatePassword(newPassword, function(err, userData) {
          if (err) {
            for (var e in err.errors) {
              if (err.errors.hasOwnProperty(e)) {
                req.form.errors.push(err.errors[e].message);
              }
            }
            return res.render('me/password', {});
          }

          req.flash('successMessage', 'パスワードを変更しました');
          return res.redirect('/me/password');
        });
      }
    } else { // method GET
      return res.render('me/password', {
      });
    }
  };

  actions.updates = function(req, res) {
    res.render('me/update', {
    });
  };

  actions.deletePicture = function(req, res) {
    // TODO: S3 からの削除
    req.user.deleteImage(function(err, data) {
      req.flash('successMessage', 'プロフィール画像を削除しました');
      res.redirect('/me');
    });
  };

  actions.authGoogle = function(req, res) {
    var googleAuth = require('../util/googleAuth')(app);

    var userData = req.user;

    var toDisconnect = req.body.disconnectGoogle ? true : false;
    var toConnect = req.body.connectGoogle ? true : false;
    if (toDisconnect) {
      userData.deleteGoogleId(function(err, userData) {
        req.flash('successMessage', 'Googleコネクトを解除しました。');

        return res.redirect('/me');
      });
    } else if (toConnect) {
      googleAuth.createAuthUrl(req, function(err, redirectUrl) {
        if (err) {
          // TODO
        }

        req.session.googleCallbackAction = '/me/auth/google/callback';
        return res.redirect(redirectUrl);
      });
    } else {
      return res.redirect('/me');
    }
  };

  actions.authGoogleCallback = function(req, res) {
    var googleAuth = require('../util/googleAuth')(app);
    var userData = req.user;

    googleAuth.handleCallback(req, function(err, tokenInfo) {
      if (err) {
        req.flash('warningMessage.auth.google', err.message); // FIXME: show library error message directly
        return res.redirect('/me'); // TODO Handling
      }

      var googleId = tokenInfo.user_id;
      var googleEmail = tokenInfo.email;
      if (!User.isEmailValid(googleEmail)) {
        req.flash('warningMessage.auth.google', 'このメールアドレスのGoogleアカウントはコネクトできません。');
        return res.redirect('/me');
      }
      userData.updateGoogleId(googleId, function(err, userData) {
        // TODO if err
        req.flash('successMessage', 'Googleコネクトを設定しました。');
        return res.redirect('/me');
      });
    });
  };


  actions.authFacebook = function(req, res) {
    var userData = req.user;

    var toDisconnect = req.body.disconnectFacebook ? true : false;
    var fbId = req.body.fbId || 0;

    if (toDisconnect) {
      userData.deleteFacebookId(function(err, userData) {
        req.flash('successMessage', 'Facebookコネクトを解除しました。');

        return res.redirect('/me');
      });
    } else if (fbId) {
      userData.updateFacebookId(fbId, function(err, userData) {
        req.flash('successMessage', 'Facebookコネクトを設定しました。');

        return res.redirect('/me');
      });
    } else {
      return res.redirect('/me');
    }
  };

  return actions;
};
