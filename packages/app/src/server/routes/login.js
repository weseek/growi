import { SupportedAction } from '~/interfaces/activity';
import loggerFactory from '~/utils/logger';
// disable all of linting
// because this file is a deprecated legacy of Crowi

module.exports = function(crowi, app) {
  const debug = require('debug')('growi:routes:login');
  const logger = loggerFactory('growi:routes:login');
  const path = require('path');
  const User = crowi.model('User');
  const {
    configManager, appService, aclService, mailService,
  } = crowi;
  const activityEvent = crowi.event('activity');

  const actions = {};

  const registerSuccessHandler = function(req, res, userData) {
    req.login(userData, (err) => {
      if (err) {
        logger.debug(err);
      }
      else {
        // update lastLoginAt
        userData.updateLastLoginAt(new Date(), (err) => {
          if (err) {
            logger.error(`updateLastLoginAt dumps error: ${err}`);
          }
        });
      }


      // userData.password cann't be empty but, prepare redirect because password property in User Model is optional
      // https://github.com/weseek/growi/pull/6670
      const redirectTo = userData.password ? req.session.redirectTo : '/me#password';

      // remove session.redirectTo
      delete req.session.redirectTo;

      const parameters = { action: SupportedAction.ACTION_USER_REGISTRATION_SUCCESS };
      activityEvent.emit('update', res.locals.activity._id, parameters);

      return res.apiv3({ redirectTo });
    });
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
    });

    const results = await Promise.allSettled(promises);
    results
      .filter(result => result.status === 'rejected')
      .forEach(result => logger.error(result.reason));
  }

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
    // const { user } = req;
    // if (user != null && user.status === User.STATUS_ACTIVE) {
    //   const { redirectTo } = req.session;
    //   // remove session.redirectTo
    //   delete req.session.redirectTo;
    //   return res.safeRedirect(redirectTo);
    // }

    // // set referer to 'redirectTo'
    // if (req.session.redirectTo == null && req.headers.referer != null) {
    //   req.session.redirectTo = req.headers.referer;
    // }

    next();
  };

  actions.register = function(req, res) {
    if (req.user != null) {
      return res.apiv3Err('user_already_logged_in', 403);
    }

    // config で closed ならさよなら
    if (configManager.getConfig('crowi', 'security:registrationMode') === aclService.labels.SECURITY_REGISTRATION_MODE_CLOSED) {
      return res.apiv3Err('registration_closed', 403);
    }

    if (!req.form.isValid) {
      const errors = req.form.errors;
      return res.apiv3Err(errors, 400);
    }

    const registerForm = req.form.registerForm || {};

    const name = registerForm.name;
    const username = registerForm.username;
    const email = registerForm.email;
    const password = registerForm.password;

    // email と username の unique チェックする
    User.isRegisterable(email, username, (isRegisterable, errOn) => {
      const errors = [];
      if (!User.isEmailValid(email)) {
        errors.push('email_address_could_not_be_used');
      }
      if (!isRegisterable) {
        if (!errOn.username) {
          errors.push('user_id_is_not_available');
        }
        if (!errOn.email) {
          errors.push('email_address_is_already_registered');
        }
      }
      if (errors.length > 0) {
        debug('isError user register error', errOn);
        return res.apiv3Err(errors, 400);
      }

      User.createUserByEmailAndPassword(name, username, email, password, undefined, async(err, userData) => {
        if (err) {
          const errors = [];
          if (err.name === 'UserUpperLimitException') {
            errors.push('can_not_register_maximum_number_of_users');
          }
          else {
            errors.push('failed_to_register');
          }
          return res.apiv3Err(errors, 405);
        }

        if (configManager.getConfig('crowi', 'security:registrationMode') !== aclService.labels.SECURITY_REGISTRATION_MODE_RESTRICTED) {
          // send mail asynchronous
          sendEmailToAllAdmins(userData);
        }

        return registerSuccessHandler(req, res, userData);
      });
    });
  };

  return actions;
};
