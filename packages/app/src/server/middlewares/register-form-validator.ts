import { body, validationResult } from 'express-validator';

// form rules
export const registerRules = () => {
  return [
    body('registerForm.username')
      .matches(/^[\da-zA-Z\-_.]+$/)
      .withMessage('Username has invalid characters')
      .not()
      .isEmpty()
      .withMessage('Username field is required'),
    body('registerForm.name').not().isEmpty().withMessage('Name field is required'),
    body('registerForm.email')
      .isEmail()
      .withMessage('Email format is invalid.')
      .exists()
      .withMessage('Email field is required.'),
    body('registerForm.password')
      .matches(/^[\x20-\x7F]*$/)
      .withMessage('Password has invalid character')
      .isLength({ min: 6 })
      .withMessage('Password minimum character should be more than 6 characters')
      .not()
      .isEmpty()
      .withMessage('Password field is required'),
    body('registerForm[app:globalLang]'),
  ];
};

// validation action
export const registerValidation = (req, res, next) => {
  const form = req.body;

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    Object.assign(form, { isValid: true });
    req.form = form;
    return next();
  }

  const extractedErrors: string[] = [];
  errors.array().map(err => extractedErrors.push(err.msg));

  Object.assign(form, {
    isValid: false,
    errors: extractedErrors,
  });
  req.form = form;

  return next();
};
