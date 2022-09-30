import express, { Request, Router } from 'express';
import { body, validationResult } from 'express-validator';

import Crowi from '../../crowi';
import { ApiV3Response } from './interfaces/apiv3-response';

module.exports = (crowi: Crowi, app: any): Router => {
  const applicationInstalled = require('../middlewares/application-installed')(crowi);
  const debug = require('debug')('growi:routes:login');
  const User = crowi.model('User');
  const router = express.Router();

  const invitedRules = () => {
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

  const invitedValidation = (req, res, next) => {
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

  router.post('/invited', applicationInstalled, invitedRules(), invitedValidation, async(req: any, res: ApiV3Response) => {
    if (!req.user) {
      return res.redirect('/login');
    }

    if (req.method === 'POST' && req.form.isValid) {
      const user = req.user;
      const invitedForm = req.form.invitedForm || {};
      const username = invitedForm.username;
      const name = invitedForm.name;
      const password = invitedForm.password;

      // check user upper limit
      const isUserCountExceedsUpperLimit = await User.isUserCountExceedsUpperLimit();
      if (isUserCountExceedsUpperLimit) {
        req.flash('warningMessage', req.t('message.can_not_activate_maximum_number_of_users'));
        return res.redirect('/invited');
      }

      const creatable = await User.isRegisterableUsername(username);
      if (creatable) {
        try {
          await user.activateInvitedUser(username, name, password);
          return res.redirect('/');
        }
        catch (err) {
          req.flash('warningMessage', req.t('message.failed_to_activate'));
          return res.render('invited');
        }
      }
      else {
        req.flash('warningMessage', req.t('message.unable_to_use_this_user'));
        debug('username', username);
        return res.render('invited');
      }
    }
    else {
      return res.render('invited');
    }
  });

  return router;
};
