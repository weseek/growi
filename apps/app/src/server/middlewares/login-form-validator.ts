import { ErrorV3 } from '@growi/core/dist/models';
import { body, validationResult, type ValidationChain } from 'express-validator';

import { DEFAULT_PASSOWRD_MINIMUM_NUMBER } from '~/consts/user';

// form rules
export const loginRules = (minPasswordLength?: number): ValidationChain[] => {
  const fixedMinPasswordLength = minPasswordLength ?? DEFAULT_PASSOWRD_MINIMUM_NUMBER;

  return [
    body('loginForm.username')
      .matches(/^[\da-zA-Z\-_.+@]+$/)
      .withMessage('message.Username or E-mail has invalid characters')
      .not()
      .isEmpty()
      .withMessage('message.Username field is required'),
    body('loginForm.password')
      .matches(/^[\x20-\x7F]*$/)
      .withMessage('message.Password has invalid character')
      .isLength({ min: fixedMinPasswordLength })
      .withMessage(new ErrorV3('message.Password minimum character should be more than n characters', undefined, undefined, { number: fixedMinPasswordLength }))
      .not()
      .isEmpty()
      .withMessage('message.Password field is required'),
  ];
};

// validation action
export const loginValidation = (req, res, next): ValidationChain[] => {
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
