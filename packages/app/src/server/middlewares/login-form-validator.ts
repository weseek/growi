import { body, validationResult } from 'express-validator';

// form rules
export const inviteRules = () => {
  return [
    body('invitedForm.username')
      .matches(/^[\da-zA-Z\-_.]+$/)
      .withMessage('message.Username has invalid characters')
      .not()
      .isEmpty()
      .withMessage('message.Username field is required'),
    body('invitedForm.name').not().isEmpty().withMessage('message.Name field is required'),
    body('invitedForm.password')
      .matches(/^[\x20-\x7F]*$/)
      .withMessage('message.Password has invalid character')
      .isLength({ min: 6 })
      .withMessage('message.Password minimum character should be more than 6 characters')
      .not()
      .isEmpty()
      .withMessage('message.Password field is required'),
  ];
};

// validation action
export const inviteValidation = (req, res, next) => {
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

// form rules
export const loginRules = () => {
  return [
    body('loginForm.username')
      .matches(/^[\da-zA-Z\-_.+@]+$/)
      .withMessage('Username or E-mail has invalid characters')
      .not()
      .isEmpty()
      .withMessage('Username field is required'),
    body('loginForm.password')
      .matches(/^[\x20-\x7F]*$/)
      .withMessage('Password has invalid character')
      .isLength({ min: 6 })
      .withMessage('Password minimum character should be more than 6 characters')
      .not()
      .isEmpty()
      .withMessage('Password field is required'),
  ];
};

// validation action
export const loginValidation = (req, res, next) => {
  const form = req.body;

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    Object.assign(form, { isValid: true });
    req.form = form;
    return next();
  }

  const extractedErrors: string[] = [];
  errors.array().map(err => extractedErrors.push(err.msg));

  req.flash('errorMessages', extractedErrors);
  Object.assign(form, { isValid: false });
  req.form = form;

  return next();
};
