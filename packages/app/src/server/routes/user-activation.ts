import path from 'path';

import { format, subSeconds } from 'date-fns';
import { body, validationResult } from 'express-validator';

import UserRegistrationOrder from '../models/user-registration-order';

export const form = (req, res): void => {
  const { userRegistrationOrder } = req;
  return res.render('user-activation', { userRegistrationOrder });
};

async function makeRegistrationEmailToken(email, crowi) {
  const {
    configManager,
    mailService,
    localeDir,
    appService,
  } = crowi;

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

    if (!isRegisterableEmail) {
      req.body.registerForm.email = email;
      req.flash('registerWarningMessage', req.t('message.email_address_is_already_registered'));
      req.flash('email', email);

      return res.redirect('/login#register');
    }

    makeRegistrationEmailToken(email, crowi);

    req.flash('successMessage', req.t('message.successfully_send_email_auth', { email }));

    return res.redirect('/login');
  };
};

// middleware to handle error
export const tokenErrorHandlerMiddeware = (err, req, res, next) => {
  if (err != null) {
    req.flash('errorMessage', req.t('message.incorrect_token_or_expired_url'));
    return res.redirect('/login#register');
  }
  next();
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

// middleware to validate complete registration form
export const validateCompleteRegistrationForm = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: string[] = [];
  errors.array().map(err => extractedErrors.push(err.msg));

  req.flash('errors', extractedErrors);
  req.flash('inputs', req.body);

  const token = req.body.token;
  return res.redirect(`/user-activation/${token}`);
};

// middleware to validate register form if email authentication enabled
export const validateRegisterForm = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  req.form = { isValid: false };
  const extractedErrors: string[] = [];
  errors.array().map(err => extractedErrors.push(err.msg));

  req.flash('registerWarningMessage', extractedErrors);

  res.redirect('back');
};
