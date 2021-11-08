import path from 'path';
import { body, validationResult } from 'express-validator';
import UserRegistrationOrder from '~/server/models/user-registration-order';

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
  const url = new URL(`/user-activation/${userRegistrationOrder.token}`, appUrl);
  const oneTimeUrl = url.href;
  const txtFileName = 'userActivation';

  return mailService.send({
    to: email,
    subject: txtFileName,
    template: path.join(localeDir, `${i18n}/notifications/${txtFileName}.txt`),
    vars: {
      appTitle: appService.getAppTitle(),
      email,
      url: oneTimeUrl,
    },
  });
}

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

export const registerAction = (crowi) => {
  return async function(req, res) {
    const registerForm = req.body.registerForm || {};
    const email = registerForm.email;

    makeRegistrationEmailToken(email, crowi);

    req.flash('successMessage', req.t('message.successfully_created', { username: email }));

    return res.redirect('/login');
  };
};

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
      return res.redirect('/');
    }

    // config で closed ならさよなら
    if (configManager.getConfig('crowi', 'security:registrationMode') === aclService.labels.SECURITY_REGISTRATION_MODE_CLOSED) {
      return res.redirect('/');
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
      if (!User.isEmailValid(email)) {
        isError = true;
        req.flash('warningMessage', req.t('message.email_address_could_not_be_used'));
      }
      if (!isRegisterable) {
        if (!errOn.username) {
          isError = true;
          req.flash('warningMessage', req.t('message.user_id_is_not_available'));
        }
        if (!errOn.email) {
          isError = true;
          req.flash('warningMessage', req.t('message.email_address_is_already_registered'));
        }
      }
      if (isError) {
        return res.redirect(`/user-activation/${userRegistrationOrder.token}`);
      }

      // Condition to save User directly without email authentication if email authentication disabled
      if (configManager.getConfig('crowi', 'security:passport-local:isEmailAuthenticationEnabled') === true) {
        User.createUserByEmailAndPassword(name, username, email, password, undefined, async(err, userData) => {
          if (err) {
            if (err.name === 'UserUpperLimitException') {
              req.flash('warningMessage', req.t('message.can_not_register_maximum_number_of_users'));
            }
            else {
              req.flash('warningMessage', req.t('message.failed_to_register'));
            }
            return res.redirect(`/user-activation/${userRegistrationOrder.token}`);
          }

          userRegistrationOrder.revokeOneTimeToken();

          if (configManager.getConfig('crowi', 'security:registrationMode') !== aclService.labels.SECURITY_REGISTRATION_MODE_RESTRICTED) {
            const admins = await User.findAdmins();
            const appTitle = appService.getAppTitle();
            const template = path.join(crowi.localeDir, 'en_US/admin/userWaitingActivation.txt');
            const url = appService.getSiteUrl();

            sendEmailToAllAdmins(userData, admins, appTitle, mailService, template, url);
          }

          req.flash('successMessage', req.t('message.successfully_created', { username: userData.username }));
          res.redirect('/login');
        });
      }
    });
  };
};

// middleware to handle error
export const handleHttpErrosMiddleware = (err, req, res, next) => {
  if (err != null) {
    req.flash('errorMessage', req.t('message.incorrect_token_or_expired_url'));
    return res.redirect('/login#register');
  }
  next();
};

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
    body('password')
      .matches(/^[\x20-\x7F]*$/)
      .withMessage('Password has invalid character')
      .isLength({ min: 6 })
      .withMessage('Password minimum character should be more than 6 characters')
      .not()
      .isEmpty()
      .withMessage('Password field is required'),
  ];
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
