import { body, validationResult } from 'express-validator';

const completeRegeistrationRules = () => {
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

const validateCompleteRegistrationForm = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  req.flash('errors', errors.array());
  req.flash('inputs', req.body);

  const token = req.body.token;
  return res.redirect(`/user-activation/${token}`);
};

module.exports = {
  completeRegeistrationRules,
  validateCompleteRegistrationForm,
};
