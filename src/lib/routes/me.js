module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('growi:routes:me')
    , fs = require('fs')
    , models = crowi.models
    , config = crowi.getConfig()
    , User = models.User
    , UserGroupRelation = models.UserGroupRelation
    , ExternalAccount = models.ExternalAccount
    , ApiResponse = require('../util/apiResponse')
    //, pluginService = require('../service/plugin')
    , actions = {}
    , api = {}
    ;

  actions.api = api;

  api.uploadPicture = function(req, res) {
    var fileUploader = require('../service/file-uploader')(crowi, app);
    //var storagePlugin = new pluginService('storage');
    //var storage = require('../service/storage').StorageService(config);

    var tmpFile = req.file || null;
    if (!tmpFile) {
      return res.json({
        'status': false,
        'message': 'File type error.'
      });
    }

    var tmpPath = tmpFile.path;
    var filePath = User.createUserPictureFilePath(req.user, tmpFile.filename + tmpFile.originalname);
    var acceptableFileType = /image\/.+/;

    if (!tmpFile.mimetype.match(acceptableFileType)) {
      return res.json({
        'status': false,
        'message': 'File type error. Only image files is allowed to set as user picture.',
      });
    }

    //debug('tmpFile Is', tmpFile, tmpFile.constructor, tmpFile.prototype);
    //var imageUrl = storage.writeSync(storage.tofs(tmpFile), filePath, {mime: tmpFile.mimetype});
    //return return res.json({
    //  'status': true,
    //  'url': imageUrl,
    //  'message': '',
    //});
    var tmpFileStream = fs.createReadStream(tmpPath, {flags: 'r', encoding: null, fd: null, mode: '0666', autoClose: true });

    fileUploader.uploadFile(filePath, tmpFile.mimetype, tmpFileStream, {})
    .then(function(data) {
      var imageUrl = fileUploader.generateUrl(filePath);
      req.user.updateImage(imageUrl, function(err, data) {
        fs.unlink(tmpPath, function(err) {
          // エラー自体は無視
          if (err) {
            debug('Error while deleting tmp file.', err);
          }

          return res.json({
            'status': true,
            'url': imageUrl,
            'message': '',
          });
        });
      });
    }).catch(function(err) {
      debug('Uploading error', err);

      return res.json({
        'status': false,
        'message': 'Error while uploading to ',
      });
    });
  };

  /**
   * retrieve user-group-relation documents
   * @param {object} req
   * @param {object} res
   */
  api.userGroupRelations = function(req, res) {
    UserGroupRelation.findAllRelationForUser(req.user)
      .then(userGroupRelations => {
        return res.json(ApiResponse.success({userGroupRelations}));
      });
  };

  actions.index = function(req, res) {
    var userForm = req.body.userForm;
    var userData = req.user;

    if (req.method == 'POST' && req.form.isValid) {
      var name = userForm.name;
      var email = userForm.email;
      var lang = userForm.lang;
      var isEmailPublished = userForm.isEmailPublished;

      /*
       * disabled because the system no longer allows undefined email -- 2017.10.06 Yuki Takei
       *
      if (!User.isEmailValid(email)) {
        req.form.errors.push('You can\'t update to that email address');
        return res.render('me/index', {});
      }
      */

      User.findOneAndUpdate(
        { email: userData.email },                  // query
        { name, email, lang, isEmailPublished },                      // updating data
        { runValidators: true, context: 'query' },  // for validation
        //   see https://www.npmjs.com/package/mongoose-unique-validator#find--updates -- 2017.09.24 Yuki Takei
        (err) => {
          if (err) {
            Object.keys(err.errors).forEach((e) => {
              req.form.errors.push(err.errors[e].message);
            });
            return res.render('me/index', {});
          }
          req.i18n.changeLanguage(lang);
          req.flash('successMessage', req.t('Updated'));
          return res.redirect('/me');
        });

    }
    else { // method GET
      /*
       * disabled because the system no longer allows undefined email -- 2017.10.06 Yuki Takei
       *
      /// そのうちこのコードはいらなくなるはず
      if (!userData.isEmailSet()) {
        req.flash('warningMessage', 'メールアドレスが設定されている必要があります');
      }
      */

      return res.render('me/index', {
      });
    }
  };

  actions.imagetype = function(req, res) {
    if (req.method !== 'POST') {
      // do nothing
      return;
    }
    else if (!req.form.isValid) {
      req.flash('errorMessage', req.form.errors.join('\n'));
      return;
    }

    var imagetypeForm = req.body.imagetypeForm;
    var userData = req.user;

    var isGravatarEnabled = imagetypeForm.isGravatarEnabled;

    userData.updateIsGravatarEnabled(isGravatarEnabled, function(err, userData) {
      if (err) {
        for (var e in err.errors) {
          if (err.errors.hasOwnProperty(e)) {
            req.form.errors.push(err.errors[e].message);
          }
        }
        return res.render('me/index', {});
      }

      req.flash('successMessage', req.t('Updated'));
      return res.redirect('/me');
    });
  };

  actions.externalAccounts = {};
  actions.externalAccounts.list = function(req, res) {
    const userData = req.user;

    let renderVars = {};
    ExternalAccount.find({user: userData})
      .then((externalAccounts) => {
        renderVars.externalAccounts = externalAccounts;
        return;
      })
      .then(() => {
        if (req.method == 'POST' && req.form.isValid) {
          // TODO impl
          return res.render('me/external-accounts', renderVars);
        }
        else { // method GET
          return res.render('me/external-accounts', renderVars);
        }
      });
  };

  actions.externalAccounts.disassociate = function(req, res) {
    const userData = req.user;

    const redirectWithFlash = (type, msg) => {
      req.flash(type, msg);
      return res.redirect('/me/external-accounts');
    };

    if (req.body == null) {
      redirectWithFlash('errorMessage', 'Invalid form.');
    }

    // make sure password set or this user has two or more ExternalAccounts
    new Promise((resolve, reject) => {
      if (userData.password != null) {
        resolve(true);
      }
      else {
        ExternalAccount.count({user: userData})
          .then((count) => {
            resolve(count > 1);
          });
      }
    })
    .then((isDisassociatable) => {
      if (!isDisassociatable) {
        let e = new Error();
        e.name = 'couldntDisassociateError';
        throw e;
      }

      const providerType = req.body.providerType;
      const accountId = req.body.accountId;

      return ExternalAccount.findOneAndRemove({providerType, accountId, user: userData});
    })
    .then((account) => {
      if (account == null) {
        return redirectWithFlash('errorMessage', 'ExternalAccount not found.');
      }
      else {
        return redirectWithFlash('successMessage', 'Successfully disassociated.');
      }
    })
    .catch((err) => {
      if (err) {
        if (err.name == 'couldntDisassociateError') {
          return redirectWithFlash('couldntDisassociateError', true);
        }
        else {
          return redirectWithFlash('errorMessage', err.message);
        }
      }
    });

  };

  actions.externalAccounts.associateLdap = function(req, res) {
    const passport = require('passport');
    const passportService = crowi.passportService;

    const redirectWithFlash = (type, msg) => {
      req.flash(type, msg);
      return res.redirect('/me/external-accounts');
    };

    if (!passportService.isLdapStrategySetup) {
      debug('LdapStrategy has not been set up');
      return redirectWithFlash('warning', 'LdapStrategy has not been set up');
    }

    const loginForm = req.body.loginForm;

    passport.authenticate('ldapauth', (err, user, info) => {
      if (res.headersSent) {  // dirty hack -- 2017.09.25
        return;               // cz: somehow passport.authenticate called twice when ECONNREFUSED error occurred
      }

      if (err) {  // DB Error
        console.log('LDAP Server Error: ', err);
        return redirectWithFlash('warningMessage', 'LDAP Server Error occured.');
      }
      if (info && info.message) {
        return redirectWithFlash('warningMessage', info.message);
      }
      if (user) {
        // create ExternalAccount
        const ldapAccountId = passportService.getLdapAccountIdFromReq(req);
        const user = req.user;

        ExternalAccount.associate('ldap', ldapAccountId, user)
          .then(() => {
            return redirectWithFlash('successMessage', 'Successfully added.');
          })
          .catch((err) => {
            return redirectWithFlash('errorMessage', err.message);
          });

      }
    })(req, res, () => {});


  };

  actions.password = function(req, res) {
    var passwordForm = req.body.mePassword;
    var userData = req.user;

    /*
      * disabled because the system no longer allows undefined email -- 2017.10.06 Yuki Takei
      *
    // パスワードを設定する前に、emailが設定されている必要がある (schemaを途中で変更したため、最初の方の人は登録されていないかもしれないため)
    // そのうちこのコードはいらなくなるはず
    if (!userData.isEmailSet()) {
      return res.redirect('/me');
    }
    */

    if (req.method == 'POST' && req.form.isValid) {
      var newPassword = passwordForm.newPassword;
      var newPasswordConfirm = passwordForm.newPasswordConfirm;
      var oldPassword = passwordForm.oldPassword;

      if (userData.isPasswordSet() && !userData.isPasswordValid(oldPassword)) {
        req.form.errors.push('Wrong current password');
        return res.render('me/password', {
        });
      }

      // check password confirm
      if (newPassword != newPasswordConfirm) {
        req.form.errors.push('Failed to verify passwords');
      }
      else {
        userData.updatePassword(newPassword, function(err, userData) {
          if (err) {
            for (var e in err.errors) {
              if (err.errors.hasOwnProperty(e)) {
                req.form.errors.push(err.errors[e].message);
              }
            }
            return res.render('me/password', {});
          }

          req.flash('successMessage', 'Password updated');
          return res.redirect('/me/password');
        });
      }
    }
    else { // method GET
      return res.render('me/password', {
      });
    }
  };

  actions.apiToken = function(req, res) {
    var apiTokenForm = req.body.apiTokenForm;
    var userData = req.user;

    if (req.method == 'POST' && req.form.isValid) {
      userData.updateApiToken()
      .then(function(userData) {
        req.flash('successMessage', 'API Token updated');
        return res.redirect('/me/apiToken');
      })
      .catch(function(err) {
        //req.flash('successMessage',);
        req.form.errors.push('Failed to update API Token');
        return res.render('me/api_token', {
        });
      });
    }
    else {
      return res.render('me/api_token', {
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
      req.flash('successMessage', 'Deleted profile picture');
      res.redirect('/me');
    });
  };

  actions.authGoogle = function(req, res) {
    var googleAuth = require('../util/googleAuth')(config);

    var userData = req.user;

    var toDisconnect = req.body.disconnectGoogle ? true : false;
    var toConnect = req.body.connectGoogle ? true : false;
    if (toDisconnect) {
      userData.deleteGoogleId(function(err, userData) {
        req.flash('successMessage', 'Disconnected from Google account');

        return res.redirect('/me');
      });
    }
    else if (toConnect) {
      googleAuth.createAuthUrl(req, function(err, redirectUrl) {
        if (err) {
          // TODO
        }

        req.session.googleCallbackAction = '/me/auth/google/callback';
        return res.redirect(redirectUrl);
      });
    }
    else {
      return res.redirect('/me');
    }
  };

  actions.authGoogleCallback = function(req, res) {
    var googleAuth = require('../util/googleAuth')(config);
    var userData = req.user;

    googleAuth.handleCallback(req, function(err, tokenInfo) {
      if (err) {
        req.flash('warningMessage.auth.google', err.message); // FIXME: show library error message directly
        return res.redirect('/me'); // TODO Handling
      }

      var googleId = tokenInfo.user_id;
      var googleEmail = tokenInfo.email;
      if (!User.isEmailValid(googleEmail)) {
        req.flash('warningMessage.auth.google', 'You can\'t connect with this  Google\'s account');
        return res.redirect('/me');
      }

      User.findUserByGoogleId(googleId, function(err, googleUser) {
        if (!err && googleUser) {
          req.flash('warningMessage.auth.google', 'This Google\'s account is connected by another user');
          return res.redirect('/me');
        }
        else {
          userData.updateGoogleId(googleId, function(err, userData) {
            if (err) {
              debug('Failed to updateGoogleId', err);
              req.flash('warningMessage.auth.google', 'Failed to connect Google Account');
              return res.redirect('/me');
            }

            // TODO if err
            req.flash('successMessage', 'Connected with Google');
            return res.redirect('/me');
          });
        }
      });
    });
  };

  return actions;
};
