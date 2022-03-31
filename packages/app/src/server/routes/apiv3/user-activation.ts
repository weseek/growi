import path from 'path';
import * as express from 'express';
import { body, validationResult } from 'express-validator';
import ErrorV3 from '../../models/vo/error-apiv3';

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

    // config で closed ならさよなら
    if (configManager.getConfig('crowi', 'security:registrationMode') === aclService.labels.SECURITY_REGISTRATION_MODE_CLOSED) {
      return res.apiv3Err(new ErrorV3('Registration closed', 'registration-failed'), 403);
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

      if (configManager.getConfig('crowi', 'security:passport-local:isEmailAuthenticationEnabled') === true) {
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

          userRegistrationOrder.revokeOneTimeToken();

          if (configManager.getConfig('crowi', 'security:registrationMode') !== aclService.labels.SECURITY_REGISTRATION_MODE_RESTRICTED) {
            const admins = await User.findAdmins();
            const appTitle = appService.getAppTitle();
            const template = path.join(crowi.localeDir, 'en_US/admin/userWaitingActivation.txt');
            const url = appService.getSiteUrl();

            sendEmailToAllAdmins(userData, admins, appTitle, mailService, template, url);
          }

          req.flash('successMessage', req.t('message.successfully_created', { username }));
          res.apiv3({ status: 'ok' });
        });
      }
      else {
        return res.apiv3Err(new ErrorV3('Email authentication configuration is disabled', 'registration-failed'), 403);
      }
    });
  };
};
