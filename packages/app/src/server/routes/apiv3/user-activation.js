import rateLimit from 'express-rate-limit';

import ErrorV3 from '~/server/models/vo/error-apiv3';
import injectResetOrderByTokenMiddleware from '~/server/middlewares/inject-reset-order-by-token-middleware';
import loggerFactory from '~/utils/logger';

import PasswordResetOrder from '../../models/password-reset-order';
import UserRegistrationOrder from '~/server/models/user-registration-order';

const logger = loggerFactory('growi:routes:apiv3:userActivation'); // eslint-disable-line no-unused-vars

const express = require('express');
const { body } = require('express-validator');
const { serializeUserSecurely } = require('../../models/serializers/user-serializer');

const router = express.Router();

module.exports = (crowi) => {
  const {
    configManager, appService, aclService, mailService, t,
  } = crowi;
  const path = require('path');
  const User = crowi.model('User');
  const csrf = require('../../middlewares/csrf')(crowi);

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message:
      'Too many requests were sent from this IP. Please try a password reset request again on the password reset request form',
  });

  router.put('/', injectResetOrderByTokenMiddleware, async(req, res) => {
    const token = req.params.token || req.body.token;
    const passwordResetOrder = await PasswordResetOrder.findOne({ token });

    const userRegistrationOrder = await UserRegistrationOrder.findOne({ email: passwordResetOrder.email });

    try {
      const userData = await registerUser(userRegistrationOrder);
      const serializedUserData = serializeUserSecurely(userData);
      passwordResetOrder.revokeOneTimeToken();
      userRegistrationOrder.remove(); // delete userRegistrationOrder data
      // TODO: send user activation successful email notification
      // await sendPasswordResetEmail('passwordResetSuccessful', i18n, email);
      return res.apiv3({ userData: serializedUserData });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err('update-password-failed');
    }
  });

  function registerUser(userRegistrationOrder) {
    const name = userRegistrationOrder.name;
    const username = userRegistrationOrder.username;
    const email = userRegistrationOrder.email;
    const password = userRegistrationOrder.password;

    // email と username の unique チェックする
    User.isRegisterable(email, username, (isRegisterable, errOn) => {
      if (!User.isEmailValid(email)) {
        return new Error('email_address_could_not_be_used');
      }
      if (!isRegisterable) {
        if (!errOn.username) {
          return new Error('user_id_is_not_available');
        }
        if (!errOn.email) {
          return new Error('email_address_is_already_registered');
        }
      }

      User.createUserByEmailAndPassword(name, username, email, password, undefined, async(err, userData) => {
        if (err) {
          if (err.name === 'UserUpperLimitException') {
            return new Error('can_not_register_maximum_number_of_users');
          }
          return new Error('failed_to_register');
        }

        if (configManager.getConfig('crowi', 'security:registrationMode') !== aclService.labels.SECURITY_REGISTRATION_MODE_RESTRICTED) {
          // send mail asynchronous
          sendEmailToAllAdmins(userData);
        }

        return userData;
      });
    });
  }

  async function sendEmailToAllAdmins(userData) {
    // send mails to all admin users (derived from crowi) -- 2020.06.18 Yuki Takei
    // ref: server/routes/login.js
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

  // middleware to handle error
  router.use((error, req, res, next) => {
    if (error != null) {
      return res.apiv3Err(new ErrorV3(error.message, error.code));
    }
    next();
  });

  return router;
};
