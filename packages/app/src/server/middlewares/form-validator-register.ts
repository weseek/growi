import { check, validationResult } from 'express-validator';

async function registerRules(isEmailAuthenticationEnabled, req) {
  // await and run(req) need to be called to take effect of conditional (isEmailAuthenticationEnabled) validation rules
  if (isEmailAuthenticationEnabled === false) {
    await check('registerForm.username')
      .matches(/^[\da-zA-Z\-_.]+$/)
      .withMessage('User ID has invalid characters.')
      .exists()
      .withMessage('User ID field is required.')
      .run(req);
    await check('registerForm.name').exists().withMessage('Name field is required.').run(req);
    await check('registerForm.email')
      .isEmail()
      .withMessage('Email format is invalid.')
      .exists()
      .withMessage('Email field is invalid.')
      .run(req);
    await check('registerForm.password')
      .matches(/^[\x20-\x7F]*$/)
      .withMessage('Password has invalid character.')
      .isLength({ min: 6 })
      .withMessage('Password minimum character should be more than 6 characters.')
      .exists()
      .withMessage('Password field is required.')
      .run(req);
  }
  else {
    await check('registerForm.email')
      .isEmail()
      .withMessage('Email format is invalid.')
      .exists()
      .withMessage('Email field is required.')
      .run(req);
  }
}

const validateRegisterForm = (crowi) => {
  const { configManager } = crowi;
  return async(req, res, next) => {
    const registerForm = req.body.registerForm;
    const isEmailAuthenticationEnabled = configManager.getConfig('crowi', 'security:passport-local:isEmailAuthenticationEnabled');
    await registerRules(isEmailAuthenticationEnabled, req);

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      // manual set next req, so we don't need update login.register() method
      req.form = {
        isValid: true,
        registerForm,
      };
      return next();
    }

    req.form = { isValid: false };
    const extractedErrors: string[] = [];
    errors.array().map(err => extractedErrors.push(err.msg));

    req.flash('registerWarningMessage', extractedErrors);

    return next();
  };
};

module.exports = {
  validateRegisterForm,
};
