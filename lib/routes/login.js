module.exports = function(app) {
  'use strict';

  var googleapis = require('googleapis')
    , debug = require('debug')('crowi:routes:login')
    , async    = require('async')
    , models = app.set('models')
    , config = app.set('config')
    , mailer = app.set('mailer')
    , Page = models.Page
    , User = models.User
    , Config = models.Config
    , Revision = models.Revision
    , actions = {};

  var loginSuccess = function(req, res, userData) {
    req.user = req.session.user = userData;
    if (!userData.password) {
      return res.redirect('/me/password');
    }

    var jumpTo = req.session.jumpTo;
    if (jumpTo) {
      req.session.jumpTo = null;
      return res.redirect(jumpTo);
    } else {
      return res.redirect('/');
    }
  };

  var loginFailure = function(req, res) {
    req.flash('warningMessage', 'ログインに失敗しました');
    return res.redirect('/login');
  };

  actions.googleCallback = function(req, res) {
    var nextAction = req.session.googleCallbackAction || '/login';
    debug('googleCallback.nextAction', nextAction);
    req.session.googleAuthCode = req.query.code || '';

    return res.redirect(nextAction);
  };

  actions.error = function(req, res) {
    var reason = req.params.reason
      , reasonMessage = ''
      ;

    if (reason === 'suspended') {
      reasonMessage = 'このアカウントは停止されています。';
    } else if (reason === 'registered') {
      reasonMessage = '管理者の承認をお待ちください。';
    } else {
    }

    return res.render('login/error', {
      reason: reason,
      reasonMessage: reasonMessage
    });
  };

  actions.login = function(req, res) {
    var loginForm = req.body.loginForm;

    if (req.method == 'POST' && req.form.isValid) {
      var email = loginForm.email;
      var password = loginForm.password;

      User.findUserByEmailAndPassword(email, password, function(err, userData) {
        debug('on login findUserByEmailAndPassword', err, userData);
        if (userData) {
          loginSuccess(req, res, userData);
        } else {
          loginFailure(req, res);
        }
      });
    } else { // method GET
      return res.render('login', {
      });
    }
  };

  actions.loginGoogle = function(req, res) {
    var googleAuth = require('../util/googleAuth')(app);
    var code = req.session.googleAuthCode || null;

    if (!code) {
      googleAuth.createAuthUrl(req, function(err, redirectUrl) {
        if (err) {
          // TODO
        }

        req.session.googleCallbackAction = '/login/google';
        return res.redirect(redirectUrl);
      });
    } else {
      googleAuth.handleCallback(req, function(err, tokenInfo) {
        debug('handleCallback', err, tokenInfo);
        if (err) {
          return loginFailure(req, res);
        }

        var googleId = tokenInfo.user_id;
        User.findUserByGoogleId(googleId, function(err, userData) {
          debug('findUserByGoogleId', err, userData);
          if (!userData) {
            return loginFailure(req, res);
          }
          return loginSuccess(req, res, userData);
        });
      });
    }
  };

  actions.loginFacebook = function(req, res) {
    var facebook = req.facebook;

    facebook.getUser(function(err, fbId) {
      if (err || !fbId) {
        req.user = req.session.user = false;
        return res.redirect('/login');
      }

      User.findUserByFacebookId(fbId, function(err, userData) {
        debug('on login findUserByFacebookId', err, userData);
        if (userData) {
          return loginSuccess(req, res, userData);
        } else {
          return loginFailure(req, res);
        }
      });
    });
  };

  actions.register = function(req, res) {
    var registerForm = req.form.registerForm || {};
    var googleAuth = require('../util/googleAuth')(app);

    // ログイン済みならさようなら
    if (req.user) {
      return res.redirect('/');
    }

    // config で closed ならさよなら
    if (config.crowi['security:registrationMode'] == Config.SECURITY_REGISTRATION_MODE_CLOSED) {
      return res.redirect('/');
    }

    if (req.method == 'POST' && req.form.isValid) {
      var name = registerForm.name;
      var username = registerForm.username;
      var email = registerForm.email;
      var password = registerForm.password;
      var facebookId = registerForm.fbId || null;
      var googleId = registerForm.googleId || null;

      // email と username の unique チェックする
      User.isRegisterable(email, username, function (isRegisterable, errOn) {
        var isError = false;
        if (!User.isEmailValid(email)) {
          isError = true;
          req.flash('registerWarningMessage', 'このメールアドレスは登録できません。(ホワイトリストなどを確認してください)');
        }
        if (!isRegisterable) {
          if (!errOn.username) {
            isError = true;
            req.flash('registerWarningMessage', 'このユーザーIDは利用できません。');
          }
          if (!errOn.email) {
            isError = true;
            req.flash('registerWarningMessage', 'このメールアドレスは登録済みです。');
          }

        }
        if (isError) {
          return res.render('login', {
          });
        }

        User.createUserByEmailAndPassword(name, username, email, password, function(err, userData) {
          if (err) {
            req.flash('registerWarningMessage', 'ユーザー登録に失敗しました。');
            return res.redirect('/login?register=1');
          } else {

            // 作成後、承認が必要なモードなら、管理者に通知する
            if (config.crowi['security:registrationMode'] === Config.SECURITY_REGISTRATION_MODE_RESTRICTED) {
              // TODO send mail
              User.findAdmins(function(err, admins) {
                async.each(
                  admins,
                  function(adminUser, next) {
                    mailer.send({
                        to: adminUser.email,
                        subject: '[' + config.crowi['app:title'] + ':admin] A New User Created and Waiting for Activation',
                        template: 'admin/userWaitingActivation.txt',
                        vars: {
                          createdUser: userData,
                          adminUser: adminUser,
                          url: config.crowi['app:url'],
                          appTitle: config.crowi['app:title'],
                        }
                      },
                      function (err, s) {
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

            if (facebookId || googleId) {
              userData.updateGoogleIdAndFacebookId(googleId, facebookId, function(err, userData) {
                if (err) { // TODO
                }
                return loginSuccess(req, res, userData);
              });
            } else {
              return loginSuccess(req, res, userData);
            }
          }
        });
      });
    } else { // method GET
      // google callback を受ける可能性もある
      var code = req.session.googleAuthCode || null;

      debug('register. if code', code);
      if (code) {
        googleAuth.handleCallback(req, function(err, tokenInfo) {
          if (err) {
            req.flash('registerWarningMessage', 'Googleコネクト中にエラーが発生しました。');
            return res.redirect('/login?register=1'); // TODO Handling
          }

          var googleId = tokenInfo.user_id;
          var googleEmail = tokenInfo.email;
          if (!User.isEmailValid(googleEmail)) {
            req.flash('registerWarningMessage', 'このメールアドレスのGoogleアカウントはコネクトできません。');
            return res.redirect('/login?register=1');
          }

          return res.render('login', {
            googleId: googleId,
            googleEmail: googleEmail,
          });
        });
      } else {
        return res.render('login', {
        });
      }
    }
  };

  actions.registerGoogle = function(req, res) {
    var googleAuth = require('../util/googleAuth')(app);
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
            } else {
              return res.redirect('/');
            }
          });
        } else {
          req.flash('warningMessage', '利用できないユーザーIDです。');
          debug('username', username);
          return res.render('invited');
        }
      });
    } else {
      return res.render('invited', {
      });
    }
  };

  actions.updateInvitedUser = function(req, res) {
    return res.redirect('/');
  };

  return actions;
};
