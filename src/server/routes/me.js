module.exports = function(crowi, app) {
  const debug = require('debug')('growi:routes:me');
  const logger = require('@alias/logger')('growi:routes:me');
  const models = crowi.models;
  const User = models.User;
  const UserGroupRelation = models.UserGroupRelation;
  const ExternalAccount = models.ExternalAccount;
  const ApiResponse = require('../util/apiResponse');

  // , pluginService = require('../service/plugin')

  const actions = {};

  const api = {};
  actions.api = api;

  /**
   * retrieve user-group-relation documents
   * @param {object} req
   * @param {object} res
   */
  api.userGroupRelations = function(req, res) {
    UserGroupRelation.findAllRelationForUser(req.user)
      .then((userGroupRelations) => {
        return res.json(ApiResponse.success({ userGroupRelations }));
      });
  };

  actions.index = function(req, res) {
    const userForm = req.body.userForm;
    const userData = req.user;

    if (req.method === 'POST' && req.form.isValid) {
      const name = userForm.name;
      const email = userForm.email;
      const lang = userForm.lang;
      const isEmailPublished = userForm.isEmailPublished;

      /*
       * disabled because the system no longer allows undefined email -- 2017.10.06 Yuki Takei
       *
      if (!User.isEmailValid(email)) {
        req.form.errors.push('You can\'t update to that email address');
        return res.render('me/index', {});
      }
      */

      User.findOneAndUpdate(
        /* eslint-disable object-curly-newline */
        { email: userData.email }, //                   query
        { name, email, lang, isEmailPublished }, //     updating data
        { runValidators: true, context: 'query' }, //   for validation
        // see https://www.npmjs.com/package/mongoose-unique-validator#find--updates -- 2017.09.24 Yuki Takei
        /* eslint-enable object-curly-newline */
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
        },
      );
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
    if (!req.form.isValid) {
      req.flash('errorMessage', req.form.errors.join('\n'));
      return;
    }

    const imagetypeForm = req.body.imagetypeForm;
    const userData = req.user;

    const isGravatarEnabled = imagetypeForm.isGravatarEnabled;

    userData.updateIsGravatarEnabled(isGravatarEnabled, (err, userData) => {
      if (err) {
        /* eslint-disable no-restricted-syntax, no-prototype-builtins */
        for (const e in err.errors) {
          if (err.errors.hasOwnProperty(e)) {
            req.form.errors.push(err.errors[e].message);
          }
        }
        /* eslint-enable no-restricted-syntax, no-prototype-builtins */
        return res.render('me/index', {});
      }

      req.flash('successMessage', req.t('Updated'));
      return res.redirect('/me');
    });
  };

  actions.externalAccounts = {};
  actions.externalAccounts.list = function(req, res) {
    const userData = req.user;

    const renderVars = {};
    ExternalAccount.find({ user: userData })
      .then((externalAccounts) => {
        renderVars.externalAccounts = externalAccounts;
        return;
      })
      .then(() => {
        if (req.method === 'POST' && req.form.isValid) {
          // TODO impl
          return res.render('me/external-accounts', renderVars);
        }
        // method GET
        return res.render('me/external-accounts', renderVars);
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
        ExternalAccount.count({ user: userData })
          .then((count) => {
            resolve(count > 1);
          });
      }
    })
      .then((isDisassociatable) => {
        if (!isDisassociatable) {
          const e = new Error();
          e.name = 'couldntDisassociateError';
          throw e;
        }

        const providerType = req.body.providerType;
        const accountId = req.body.accountId;

        return ExternalAccount.findOneAndRemove({ providerType, accountId, user: userData });
      })
      .then((account) => {
        if (account == null) {
          return redirectWithFlash('errorMessage', 'ExternalAccount not found.');
        }

        return redirectWithFlash('successMessage', 'Successfully disassociated.');
      })
      .catch((err) => {
        if (err) {
          if (err.name === 'couldntDisassociateError') {
            return redirectWithFlash('couldntDisassociateError', true);
          }

          return redirectWithFlash('errorMessage', err.message);
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

    passport.authenticate('ldapauth', (err, user, info) => {
      if (res.headersSent) { // dirty hack -- 2017.09.25
        return; //              cz: somehow passport.authenticate called twice when ECONNREFUSED error occurred
      }

      if (err) { // DB Error
        logger.error('LDAP Server Error: ', err);
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
    const passwordForm = req.body.mePassword;
    const userData = req.user;

    /*
      * disabled because the system no longer allows undefined email -- 2017.10.06 Yuki Takei
      *
    // パスワードを設定する前に、emailが設定されている必要がある (schemaを途中で変更したため、最初の方の人は登録されていないかもしれないため)
    // そのうちこのコードはいらなくなるはず
    if (!userData.isEmailSet()) {
      return res.redirect('/me');
    }
    */

    if (req.method === 'POST' && req.form.isValid) {
      const newPassword = passwordForm.newPassword;
      const newPasswordConfirm = passwordForm.newPasswordConfirm;
      const oldPassword = passwordForm.oldPassword;

      if (userData.isPasswordSet() && !userData.isPasswordValid(oldPassword)) {
        req.form.errors.push('Wrong current password');
        return res.render('me/password', {
        });
      }

      // check password confirm
      if (newPassword !== newPasswordConfirm) {
        req.form.errors.push('Failed to verify passwords');
      }
      else {
        userData.updatePassword(newPassword, (err, userData) => {
          if (err) {
            /* eslint-disable no-restricted-syntax, no-prototype-builtins */
            for (const e in err.errors) {
              if (err.errors.hasOwnProperty(e)) {
                req.form.errors.push(err.errors[e].message);
              }
            }
            return res.render('me/password', {});
          }
          /* eslint-enable no-restricted-syntax, no-prototype-builtins */

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
    const userData = req.user;

    if (req.method === 'POST' && req.form.isValid) {
      userData.updateApiToken()
        .then((userData) => {
          req.flash('successMessage', 'API Token updated');
          return res.redirect('/me/apiToken');
        })
        .catch((err) => {
        // req.flash('successMessage',);
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

  actions.authGoogle = function(req, res) {
    const googleAuth = require('../util/googleAuth')(crowi);

    const userData = req.user;

    const toDisconnect = !!req.body.disconnectGoogle;
    const toConnect = !!req.body.connectGoogle;
    if (toDisconnect) {
      userData.deleteGoogleId((err, userData) => {
        req.flash('successMessage', 'Disconnected from Google account');

        return res.redirect('/me');
      });
    }
    else if (toConnect) {
      googleAuth.createAuthUrl(req, (err, redirectUrl) => {
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
    const googleAuth = require('../util/googleAuth')(crowi);
    const userData = req.user;

    googleAuth.handleCallback(req, (err, tokenInfo) => {
      if (err) {
        req.flash('warningMessage.auth.google', err.message); // FIXME: show library error message directly
        return res.redirect('/me'); // TODO Handling
      }

      const googleId = tokenInfo.user_id;
      const googleEmail = tokenInfo.email;
      if (!User.isEmailValid(googleEmail)) {
        req.flash('warningMessage.auth.google', 'You can\'t connect with this  Google\'s account');
        return res.redirect('/me');
      }

      User.findUserByGoogleId(googleId, (err, googleUser) => {
        if (!err && googleUser) {
          req.flash('warningMessage.auth.google', 'This Google\'s account is connected by another user');
          return res.redirect('/me');
        }

        userData.updateGoogleId(googleId, (err, userData) => {
          if (err) {
            debug('Failed to updateGoogleId', err);
            req.flash('warningMessage.auth.google', 'Failed to connect Google Account');
            return res.redirect('/me');
          }

          // TODO if err
          req.flash('successMessage', 'Connected with Google');
          return res.redirect('/me');
        });
      });
    });
  };

  return actions;
};
