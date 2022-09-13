import express from 'express';

import { SupportedAction } from '~/interfaces/activity';
import loggerFactory from '~/utils/logger';

module.exports = (crowi) => {
  const debug = require('debug')('growi:routes:login');
  const logger = loggerFactory('growi:routes:login');
  const router = express.Router();
  const path = require('path');
  const User = crowi.model('User');
  const {
    configManager, appService, aclService, mailService,
  } = crowi;
  const activityEvent = crowi.event('activity');

  const registerSuccessHandler = function(req, res, userData) {
    req.login(userData, (err) => {
      if (err) {
        logger.debug(err);
        // I created a flash message in case the user information that processing was successful is not stored in the session.
        req.flash('successMessage', req.t('message.successfully_created', { username: userData.username }));
      }
      else {
        // update lastLoginAt
        userData.updateLastLoginAt(new Date(), (err) => {
          if (err) {
            logger.error(`updateLastLoginAt dumps error: ${err}`);
          }
        });
      }
      // RegisterFormValidator.registerRule had code to guarantee that there was a password,
      // but login.register did not. so I wrote this code.
      if (!userData.password) {
        return res.redirect('/me#password');
      }

      const { redirectTo } = req.session;
      // remove session.redirectTo
      delete req.session.redirectTo;

      const parameters = { action: SupportedAction.ACTION_USER_REGISTRATION_SUCCESS };
      activityEvent.emit('update', res.locals.activity._id, parameters);

      return res.safeRedirect(redirectTo);
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

    const results: any = await Promise.allSettled(promises);
    results
      .filter(result => result.status === 'rejected')
      .forEach(result => logger.error(result.reason));
  }
  // eslint-disable-next-line max-len
  router.post('/', async(req: any, res) => {
    if (req.user != null) {
      return res.redirect('/');
    }

    // config で closed ならさよなら
    if (configManager.getConfig('crowi', 'security:registrationMode') === aclService.labels.SECURITY_REGISTRATION_MODE_CLOSED) {
      return res.redirect('/');
    }

    if (req.method === 'POST' && req.form.isValid) {
      const registerForm = req.form.registerForm || {};

      const name = registerForm.name;
      const username = registerForm.username;
      const email = registerForm.email;
      const password = registerForm.password;

      // email と username の unique チェックする
      User.isRegisterable(email, username, (isRegisterable, errOn) => {
        const errors: string[] = [];
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
          return res.send({ errors: ['email_address_could_not_be_used', 'user_id_is_not_available', 'email_address_is_already_registered'] });
        }

        User.createUserByEmailAndPassword(name, username, email, password, undefined, async(err, userData) => {
          if (err) {
            const errors: string[] = [];
            if (err.name === 'UserUpperLimitException') {
              errors.push('can_not_register_maximum_number_of_users');
            }
            else {
              errors.push('failed_to_register');
            }
            return res.redirect(`/register?errors=${errors}`);
          }

          if (configManager.getConfig('crowi', 'security:registrationMode') !== aclService.labels.SECURITY_REGISTRATION_MODE_RESTRICTED) {
            // send mail asynchronous
            sendEmailToAllAdmins(userData);
          }


          return registerSuccessHandler(req, res, userData);
        });
      });
    }
    else { // method GET of form is not valid
      debug('session is', req.session);
      const isRegistering = true;
      return res.render('login', { isRegistering });
    }
  });

  return router;
};
