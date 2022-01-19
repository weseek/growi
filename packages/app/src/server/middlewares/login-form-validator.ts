import { body, validationResult } from 'express-validator';

// form rules
export const inviteRules = () => {
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

// validation action
export const inviteValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: string[] = [];
  errors.array().map(err => extractedErrors.push(err.msg));

  req.flash('errors', extractedErrors);
  req.flash('inputs', req.body);

  res.redirect('back');
};

// form rules
export const loginRules = () => {
  return [
    body('username')
      .matches(/^[\da-zA-Z\-_.]+$/)
      .withMessage('Username has invalid characters')
      .not()
      .isEmpty()
      .withMessage('Username field is required'),
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

// validation action
export const loginValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: string[] = [];
  errors.array().map(err => extractedErrors.push(err.msg));

  req.flash('errors', extractedErrors);
  req.flash('inputs', req.body);

  res.redirect('back');
};
