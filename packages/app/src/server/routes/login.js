// disable all of linting
// because this file is a deprecated legacy of Crowi

/* eslint-disable */

module.exports = function(crowi, app) {
  const debug = require('debug')('growi:routes:login');
  const logger = require('@alias/logger')('growi:routes:login');
  const path = require('path');
  const User = crowi.model('User');
  const { configManager, appService, aclService, mailService } = crowi;

  const actions = {};

  const loginSuccess = function(req, res, userData) {
    // transforming attributes
    // see User model
    req.user = req.session.user = userData.toObject();

    // update lastLoginAt
    userData.updateLastLoginAt(new Date(), (err, uData) => {
      if (err) {
        logger.error(`updateLastLoginAt dumps error: ${err}`);
      }
    });

    if (!userData.password) {
      return res.redirect('/me/password');
    }

    const { redirectTo } = req.session;
    // remove session.redirectTo
    delete req.session.redirectTo;
    return res.safeRedirect(redirectTo);
  };

  actions.error = function(req, res) {
    const reason = req.params.reason;


    let reasonMessage = '';
    if (reason === 'suspended') {
      reasonMessage = 'This account is suspended.';
    }
    else if (reason === 'registered') {
      reasonMessage = 'Wait for approved by administrators.';
    }

    return res.render('login/error', {
      reason,
      reasonMessage,
    });
  };

  actions.preLogin = function(req, res, next) {
    // user has already logged in
    const { user } = req;
    if (user != null && user.status === User.STATUS_ACTIVE) {
      const { redirectTo } = req.session;
      // remove session.redirectTo
      delete req.session.redirectTo;
      return res.safeRedirect(redirectTo);
    }

    // set referer to 'redirectTo'
    if (req.session.redirectTo == null && req.headers.referer != null) {
      req.session.redirectTo = req.headers.referer;
    }

    next();
  }

  actions.login = function(req, res) {
    if (req.form) {
      debug(req.form.errors);
    }

    return res.render('login', {});
  };

  actions.register = function(req, res) {
    if (req.user != null) {
      return res.redirect('/');
    }

    // config で closed ならさよなら
    if (configManager.getConfig('crowi', 'security:registrationMode') == aclService.labels.SECURITY_REGISTRATION_MODE_CLOSED) {
      return res.redirect('/');
    }

    if (req.method == 'POST' && req.form.isValid) {
      const registerForm = req.form.registerForm || {};

      const name = registerForm.name;
      const username = registerForm.username;
      const email = registerForm.email;
      const password = registerForm.password;

      // email と username の unique チェックする
      User.isRegisterable(email, username, (isRegisterable, errOn) => {
        let isError = false;
        if (!User.isEmailValid(email)) {
          isError = true;
          req.flash('registerWarningMessage', req.t('message.email_address_could_not_be_used'));
        }
        if (!isRegisterable) {
          if (!errOn.username) {
            isError = true;
            req.flash('registerWarningMessage', req.t('message.user_id_is_not_available'));
          }
          if (!errOn.email) {
            isError = true;
            req.flash('registerWarningMessage', req.t('message.email_address_is_already_registered'));
          }
        }
        if (isError) {
          debug('isError user register error', errOn);
          return res.redirect('/register');
        }

        User.createUserByEmailAndPassword(name, username, email, password, undefined, async(err, userData) => {
          if (err) {
            if (err.name === 'UserUpperLimitException') {
              req.flash('registerWarningMessage', req.t('message.can_not_register_maximum_number_of_users'));
            }
            else {
              req.flash('registerWarningMessage', req.t('message.failed_to_register'));
            }
            return res.redirect('/register');
          }

          if (configManager.getConfig('crowi', 'security:registrationMode') !== aclService.labels.SECURITY_REGISTRATION_MODE_RESTRICTED) {
            // send mail asynchronous
            sendEmailToAllAdmins(userData);
          }

          // add a flash message to inform the user that processing was successful -- 2017.09.23 Yuki Takei
          // cz. loginSuccess method doesn't work on it's own when using passport
          //      because `req.login()` prepared by passport is not called.
          req.flash('successMessage', req.t('message.successfully_created',{ username: userData.username }));

          return loginSuccess(req, res, userData);
        });
      });
    }
    else { // method GET of form is not valid
      debug('session is', req.session);
      const isRegistering = true;
      return res.render('login', { isRegistering });
    }
  };

  async function sendEmailToAllAdmins(userData) {
    // send mails to all admin users (derived from crowi) -- 2020.06.18 Yuki Takei
    const admins = await User.findAdmins();

    const appTitle = appService.getAppTitle();

    const promises = admins.map((admin) => {
      return mailService.send({
        to: admin.email,
        subject: `[${appTitle}:admin] A New User Created and Waiting for Activation`,
        template: path.join(crowi.localeDir, 'en_US/admin/userWaitingActivation.txt'),
        vars: {
          createdUser: userData,
          admin,
          url: appService.getSiteUrl(),
          appTitle,
        },
      });
    })

    const results = await Promise.allSettled(promises);
    results
      .filter(result => result.status === 'rejected')
      .forEach(result => logger.error(result.reason));
  }

  actions.invited = async function(req, res) {
    if (!req.user) {
      return res.redirect('/login');
    }

    if (req.method == 'POST' && req.form.isValid) {
      const user = req.user;
      const invitedForm = req.form.invitedForm || {};
      const username = invitedForm.username;
      const name = invitedForm.name;
      const password = invitedForm.password;

      // check user upper limit
      const isUserCountExceedsUpperLimit = await User.isUserCountExceedsUpperLimit();
      if (isUserCountExceedsUpperLimit) {
        req.flash('warningMessage', req.t('message.can_not_activate_maximum_number_of_users'));
        return res.redirect('/invited');
      }

      const creatable = await User.isRegisterableUsername(username);
      if (creatable) {
        try {
          await user.activateInvitedUser(username, name, password);
          return res.redirect('/');
        }
        catch (err) {
          req.flash('warningMessage', req.t('message.failed_to_activate'));
          return res.render('invited');
        }
      }
      else {
        req.flash('warningMessage', req.t('message.unable_to_use_this_user'));
        debug('username', username);
        return res.render('invited');
      }
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
