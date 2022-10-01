import { body, validationResult } from 'express-validator';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const invitedRules = () => {
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const invitedValidation = (req, _res, next) => {
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
