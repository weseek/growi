module.exports = function(crowi, app) {
  'use strict';

  const debug = require('debug')('growi:routes:login')
    , logger = require('@alias/logger')('growi:routes:login')
    , path = require('path')
    , async    = require('async')
    , config = crowi.getConfig()
    , mailer = crowi.getMailer()
    , User = crowi.model('User')
    , Config = crowi.model('Config')
    , actions = {};


  const clearGoogleSession = function(req) {
    req.session.googleAuthCode
      = req.session.googleId
      = req.session.googleEmail
      = req.session.googleName
      = req.session.googleImage
      = null;
  };
  const loginSuccess = function(req, res, userData) {
    req.user = req.session.user = userData;

    // update lastLoginAt
    userData.updateLastLoginAt(new Date(), (err, uData) => {
      if (err) {
        logger.error(`updateLastLoginAt dumps error: ${err}`);
      }
    });

    if (!userData.password) {
      return res.redirect('/me/password');
    }

    clearGoogleSession(req);

    const jumpTo = req.session.jumpTo;
    if (jumpTo) {
      req.session.jumpTo = null;
      return res.redirect(jumpTo);
    }
    else {
      return res.redirect('/');
    }
  };

  const loginFailure = function(req, res) {
    req.flash('warningMessage', 'Sign in failure.');
    return res.redirect('/login');
  };

  actions.googleCallback = function(req, res) {
    var nextAction = req.session.googleCallbackAction || '/login';
    debug('googleCallback.nextAction', nextAction);
    req.session.googleAuthCode = req.query.code || '';
    debug('google auth code', req.query.code);


    return res.redirect(nextAction);
  };

  actions.error = function(req, res) {
    var reason = req.params.reason
      , reasonMessage = ''
      ;

    if (reason === 'suspended') {
      reasonMessage = 'This account is suspended.';
    }
    else if (reason === 'registered') {
      reasonMessage = 'Wait for approved by administrators.';
    }

    return res.render('login/error', {
      reason: reason,
      reasonMessage: reasonMessage
    });
  };

  actions.login = function(req, res) {
    var loginForm = req.body.loginForm;

    if (req.method == 'POST' && req.form.isValid) {
      var username = loginForm.username;
      var password = loginForm.password;

      // find user
      User.findUserByUsernameOrEmail(username, password, (err, user) => {
        if (err) { return loginFailure(req, res) }
        // check existence and password
        if (!user || !user.isPasswordValid(password)) {
          return loginFailure(req, res);
        }
        return loginSuccess(req, res, user);
      });
    }
    else { // method GET
      if (req.form) {
        debug(req.form.errors);
      }
      return res.render('login', {
      });
    }
  };

  actions.loginGoogle = function(req, res) {
    var googleAuth = require('../util/googleAuth')(config);
    var code = req.session.googleAuthCode || null;

    if (!code) {
      googleAuth.createAuthUrl(req, function(err, redirectUrl) {
        if (err) {
          // TODO
        }

        req.session.googleCallbackAction = '/login/google';
        return res.redirect(redirectUrl);
      });
    }
    else {
      googleAuth.handleCallback(req, function(err, tokenInfo) {
        debug('handleCallback', err, tokenInfo);
        if (err) {
          return loginFailure(req, res);
        }

        var googleId = tokenInfo.user_id;
        User.findUserByGoogleId(googleId, function(err, userData) {
          debug('findUserByGoogleId', err, userData);
          if (!userData) {
            clearGoogleSession(req);
            return loginFailure(req, res);
          }
          return loginSuccess(req, res, userData);
        });
      });
    }
  };

  actions.register = function(req, res) {
    var googleAuth = require('../util/googleAuth')(config);
    var lang= req.lang || User.LANG_EN_US;

    // ログイン済みならさようなら
    if (req.user) {
      return res.redirect('/');
    }

    // config で closed ならさよなら
    if (config.crowi['security:registrationMode'] == Config.SECURITY_REGISTRATION_MODE_CLOSED) {
      return res.redirect('/');
    }

    if (req.method == 'POST' && req.form.isValid) {
      var registerForm = req.form.registerForm || {};

      var name = registerForm.name;
      var username = registerForm.username;
      var email = registerForm.email;
      var password = registerForm.password;
      var googleId = registerForm.googleId || null;
      var googleImage = registerForm.googleImage || null;

      // email と username の unique チェックする
      User.isRegisterable(email, username, function(isRegisterable, errOn) {
        var isError = false;
        if (!User.isEmailValid(email)) {
          isError = true;
          req.flash('registerWarningMessage', 'This email address could not be used. (Make sure the allowed email address)');
        }
        if (!isRegisterable) {
          if (!errOn.username) {
            isError = true;
            req.flash('registerWarningMessage', 'This User ID is not available.');
          }
          if (!errOn.email) {
            isError = true;
            req.flash('registerWarningMessage', 'This email address is already registered.');
          }

        }
        if (isError) {
          debug('isError user register error', errOn);
          return res.redirect('/register');
        }

        User.createUserByEmailAndPassword(name, username, email, password, lang, function(err, userData) {
          if (err) {
            req.flash('registerWarningMessage', 'Failed to register.');
            return res.redirect('/register');
          }
          else {

            // 作成後、承認が必要なモードなら、管理者に通知する
            const appTitle = Config.appTitle(config);
            if (config.crowi['security:registrationMode'] === Config.SECURITY_REGISTRATION_MODE_RESTRICTED) {
              // TODO send mail
              User.findAdmins(function(err, admins) {
                async.each(
                  admins,
                  function(adminUser, next) {
                    mailer.send({
                      to: adminUser.email,
                      subject: '[' + appTitle + ':admin] A New User Created and Waiting for Activation',
                      template: path.join(crowi.localeDir, 'en-US/admin/userWaitingActivation.txt'),
                      vars: {
                        createdUser: userData,
                        adminUser: adminUser,
                        url: config.crowi['app:url'],
                        appTitle: appTitle,
                      }
                    },
                    function(err, s) {
                      debug('completed to send email: ', err, s);
                      next();
                    }
                    );
                  },
                  function(err) {
                    debug('Sending invitation email completed.', err);
                  }
                );
              });
            }

            if (googleId) {
              userData.updateGoogleId(googleId, function(err, userData) {
                if (err) { // TODO
                }
                return loginSuccess(req, res, userData);
              });

              if (googleImage) {
                var axios = require('axios');
                var fileUploader = require('../service/file-uploader')(crowi, app);
                var filePath = User.createUserPictureFilePath(
                  userData,
                  googleImage.replace(/^.+\/(.+\..+)$/, '$1')
                );

                axios.get(googleImage, {responseType: 'stream'})
                .then(function(response) {
                  var type = response.headers['content-type'];
                  var fileStream = response.data;
                  fileStream.length = parseInt(response.headers['content-length']);

                  fileUploader.uploadFile(filePath, type, fileStream, {})
                  .then(function(data) {
                    var imageUrl = fileUploader.generateUrl(filePath);
                    debug('user picture uploaded', imageUrl);
                    userData.updateImage(imageUrl, function(err, data) {
                      if (err) {
                        debug('Error on update user image', err);
                      }
                      // DONE
                    });
                  }).catch(function(err) { // ignore
                    debug('Upload error', err);
                  });
                }).catch(function() { // ignore
                });
              }
            }
            else {
              // add a flash message to inform the user that processing was successful -- 2017.09.23 Yuki Takei
              // cz. loginSuccess method doesn't work on it's own when using passport
              //      because `req.login()` prepared by passport is not called.
              req.flash('successMessage', `The user '${userData.username}' is successfully created.`);

              return loginSuccess(req, res, userData);
            }
          }
        });
      });
    }
    else { // method GET of form is not valid
      debug('session is', req.session);
      var isRegistering = true;
      // google callback を受ける可能性もある
      var code = req.session.googleAuthCode || null;
      var googleId = req.session.googleId || null;
      var googleEmail = req.session.googleEmail || null;
      var googleName = req.session.googleName || null;
      var googleImage = req.session.googleImage || null;

      debug('register. if code', code);
      // callback 経由で reigster にアクセスしてきた時最初だけこの if に入る
      // code から email などを取得したらそれを session にいれて code は消去
      if (code) {
        googleAuth.handleCallback(req, function(err, tokenInfo) {
          debug('tokenInfo on register GET', tokenInfo);
          req.session.googleAuthCode = null;

          if (err) {
            req.flash('registerWarningMessage', 'Error on connectiong Google');
            return res.redirect('/login?register=1'); // TODO Handling
          }

          req.session.googleId = googleId = tokenInfo.user_id;
          req.session.googleEmail = googleEmail = tokenInfo.email;
          req.session.googleName = googleName = tokenInfo.name;
          req.session.googleImage = googleImage = tokenInfo.picture;

          if (!User.isEmailValid(googleEmail)) {
            req.flash('registerWarningMessage', 'このメールアドレスのGoogleアカウントはコネクトできません。');
            return res.redirect('/login?register=1');
          }
          return res.render('login', { isRegistering, googleId, googleEmail, googleName, googleImage, });
        });
      }
      else {
        return res.render('login', { isRegistering, googleId, googleEmail, googleName, googleImage, });
      }
    }
  };

  actions.registerGoogle = function(req, res) {
    var googleAuth = require('../util/googleAuth')(config);
    googleAuth.createAuthUrl(req, function(err, redirectUrl) {
      if (err) {
        // TODO
      }

      req.session.googleCallbackAction = '/register';
      return res.redirect(redirectUrl);
    });
  };

  actions.invited = function(req, res) {
    if (!req.user) {
      return res.redirect('/login');
    }

    if (req.method == 'POST' && req.form.isValid) {
      var user = req.user;
      var invitedForm = req.form.invitedForm || {};
      var username = invitedForm.username;
      var name = invitedForm.name;
      var password = invitedForm.password;

      User.isRegisterableUsername(username, function(creatable) {
        if (creatable) {
          user.activateInvitedUser(username, name, password, function(err, data) {
            if (err) {
              req.flash('warningMessage', 'アクティベートに失敗しました。');
              return res.render('invited');
            }
            else {
              return res.redirect('/');
            }
          });
        }
        else {
          req.flash('warningMessage', '利用できないユーザーIDです。');
          debug('username', username);
          return res.render('invited');
        }
      });
    }
    else {
      return res.render('invited', {
      });
    }
  };

  actions.updateInvitedUser = function(req, res) {
    return res.redirect('/');
  };

  return actions;
};
