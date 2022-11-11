import path from 'path';

import { ErrorV3 } from '@growi/core';
import { format, subSeconds } from 'date-fns';
import { body, validationResult } from 'express-validator';

import { SupportedAction } from '~/interfaces/activity';
import { RegistrationMode } from '~/interfaces/registration-mode';
import UserRegistrationOrder from '~/server/models/user-registration-order';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:routes:apiv3:user-activation');

const PASSOWRD_MINIMUM_NUMBER = 8;

// validation rules for complete registration form
export const completeRegistrationRules = () => {
  return [
    body('username')
      .matches(/^[\da-zA-Z\-_.]+$/)
      .withMessage('Username has invalid characters')
      .not()
      .isEmpty()
      .withMessage('Username field is required'),
    body('name').not().isEmpty().withMessage('Name field is required'),
    body('token').not().isEmpty().withMessage('Token value is required'),
    body('password')
      .matches(/^[\x20-\x7F]*$/)
      .withMessage('Password has invalid character')
      .isLength({ min: PASSOWRD_MINIMUM_NUMBER })
      .withMessage('Password minimum character should be more than 8 characters')
      .not()
      .isEmpty()
      .withMessage('Password field is required'),
  ];
};

// middleware to validate complete registration form
export const validateCompleteRegistration = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: string[] = [];
  errors.array().map(err => extractedErrors.push(err.msg));

  return res.apiv3Err(extractedErrors);
};

async function sendEmailToAllAdmins(userData, admins, appTitle, mailService, template, url) {
  const promises = admins.map((admin) => {
    return mailService.send({
      to: admin.email,
      subject: `[${appTitle}:admin] A New User Created and Waiting for Activation`,
      template,
      vars: {
        createdUser: userData,
        admin,
        url,
        appTitle,
      },
    });
  });
}

export const completeRegistrationAction = (crowi) => {
  const User = crowi.model('User');
  const activityEvent = crowi.event('activity');
  const {
    configManager,
    aclService,
    appService,
    mailService,
  } = crowi;

  return async function(req, res) {
    if (req.user != null) {
      return res.apiv3Err(new ErrorV3('You have been logged in', 'registration-failed'), 403);
    }

    // error when registration is not allowed
    if (configManager.getConfig('crowi', 'security:registrationMode') === aclService.labels.SECURITY_REGISTRATION_MODE_CLOSED) {
      return res.apiv3Err(new ErrorV3('Registration closed', 'registration-failed'), 403);
    }

    // error when email authentication is disabled
    if (configManager.getConfig('crowi', 'security:passport-local:isEmailAuthenticationEnabled') !== true) {
      return res.apiv3Err(new ErrorV3('Email authentication configuration is disabled', 'registration-failed'), 403);
    }

    const { userRegistrationOrder } = req;
    const registerForm = req.body;

    const email = userRegistrationOrder.email;
    const name = registerForm.name;
    const username = registerForm.username;
    const password = registerForm.password;

    // email と username の unique チェックする
    User.isRegisterable(email, username, (isRegisterable, errOn) => {
      let isError = false;
      let errorMessage = '';
      if (!User.isEmailValid(email)) {
        isError = true;
        errorMessage += req.t('message.email_address_could_not_be_used');
      }
      if (!isRegisterable) {
        if (!errOn.username) {
          isError = true;
          errorMessage += req.t('message.user_id_is_not_available');
        }
        if (!errOn.email) {
          isError = true;
          errorMessage += req.t('message.email_address_is_already_registered');
        }
      }
      if (isError) {
        return res.apiv3Err(new ErrorV3(errorMessage, 'registration-failed'), 403);
      }

      User.createUserByEmailAndPassword(name, username, email, password, undefined, async(err, userData) => {
        if (err) {
          if (err.name === 'UserUpperLimitException') {
            errorMessage = req.t('message.can_not_register_maximum_number_of_users');
          }
          else {
            errorMessage = req.t('message.failed_to_register');
          }
          return res.apiv3Err(new ErrorV3(errorMessage, 'registration-failed'), 403);
        }

        const parameters = { action: SupportedAction.ACTION_USER_REGISTRATION_SUCCESS };
        activityEvent.emit('update', res.locals.activity._id, parameters);

        userRegistrationOrder.revokeOneTimeToken();

        if (configManager.getConfig('crowi', 'security:registrationMode') === aclService.labels.SECURITY_REGISTRATION_MODE_RESTRICTED) {
          const isMailerSetup = mailService.isMailerSetup ?? false;

          if (isMailerSetup) {
            const admins = await User.findAdmins();
            const appTitle = appService.getAppTitle();
            const template = path.join(crowi.localeDir, 'en_US/admin/userWaitingActivation.txt');
            const url = appService.getSiteUrl();

            sendEmailToAllAdmins(userData, admins, appTitle, mailService, template, url);
          }
          // This 'completeRegistrationAction' should not be able to be called if the email settings is not set up in the first place.
          // So this method dows not stop processing as an error, but only displays a warning. -- 2022.11.01 Yuki Takei
          else {
            logger.warn('E-mail Settings must be set up.');
          }

          return res.apiv3({});
        }

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
          const redirectTo = userData.password != null ? '/' : '/me#password';
          return res.apiv3({ redirectTo });
        });
      });
    });
  };
};

// validation rules for registration form when email authentication enabled
export const registerRules = () => {
  return [
    body('registerForm.email')
      .isEmail()
      .withMessage('Email format is invalid.')
      .exists()
      .withMessage('Email field is required.'),
  ];
};

// middleware to validate register form if email authentication enabled
export const validateRegisterForm = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: string[] = [];
  errors.array().map(err => extractedErrors.push(err.msg));

  return res.apiv3Err(extractedErrors, 400);
};

async function makeRegistrationEmailToken(email, crowi) {
  const {
    configManager,
    mailService,
    localeDir,
    appService,
  } = crowi;

  const isMailerSetup = mailService.isMailerSetup ?? false;
  if (!isMailerSetup) {
    throw Error('mailService is not setup');
  }

  const grobalLang = configManager.getConfig('crowi', 'app:globalLang');
  const i18n = grobalLang;
  const appUrl = appService.getSiteUrl();

  const userRegistrationOrder = await UserRegistrationOrder.createUserRegistrationOrder(email);
  const grwTzoffsetSec = crowi.appService.getTzoffset() * 60;
  const expiredAt = subSeconds(userRegistrationOrder.expiredAt, grwTzoffsetSec);
  const formattedExpiredAt = format(expiredAt, 'yyyy/MM/dd HH:mm');
  const url = new URL(`/user-activation/${userRegistrationOrder.token}`, appUrl);
  const oneTimeUrl = url.href;
  const txtFileName = 'userActivation';

  return mailService.send({
    to: email,
    subject: '[GROWI] User Activation',
    template: path.join(localeDir, `${i18n}/notifications/${txtFileName}.txt`),
    vars: {
      appTitle: appService.getAppTitle(),
      email,
      expiredAt: formattedExpiredAt,
      url: oneTimeUrl,
    },
  });
}

export const registerAction = (crowi) => {
  const User = crowi.model('User');

  return async function(req, res) {
    const registerForm = req.body.registerForm || {};
    const email = registerForm.email;
    const isRegisterableEmail = await User.isRegisterableEmail(email);
    const registrationMode = crowi.configManager.getConfig('crowi', 'security:registrationMode') as RegistrationMode;
    const isEmailValid = await User.isEmailValid(email);

    if (registrationMode === RegistrationMode.CLOSED) {
      return res.apiv3Err(['message.registration_closed'], 400);
    }

    if (!isRegisterableEmail) {
      req.body.registerForm.email = email;
      return res.apiv3Err(['message.email_address_is_already_registered'], 400);
    }

    if (!isEmailValid) {
      return res.apiv3Err(['message.email_address_could_not_be_used'], 400);
    }

    try {
      await makeRegistrationEmailToken(email, crowi);
    }
    catch (err) {
      return res.apiv3Err(err);
    }

    return res.apiv3({ redirectTo: '/login#register' });
  };
};
