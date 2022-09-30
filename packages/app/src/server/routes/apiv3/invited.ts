import express, { Request, Router } from 'express';

import Crowi from '../../crowi';
import { invitedRules, invitedValidation } from '../../middlewares/invited-form-validator';

import { ApiV3Response } from './interfaces/apiv3-response';

type InvitedFormRequest = Request & { form: any, user: any };

module.exports = (crowi: Crowi): Router => {
  const applicationInstalled = require('../../middlewares/application-installed')(crowi);
  const debug = require('debug')('growi:routes:login');
  const User = crowi.model('User');
  const router = express.Router();

  router.post('/invited', applicationInstalled, invitedRules(), invitedValidation, async(req: InvitedFormRequest, res: ApiV3Response) => {
    if (!req.user) {
      return res.apiv3({ redirectTo: '/login' });
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
        // req.flash('warningMessage', req.t('message.can_not_activate_maximum_number_of_users'));
        return res.apiv3({ redirectTo: '/invited' });
      }

      const creatable = await User.isRegisterableUsername(username);
      if (creatable) {
        try {
          await user.activateInvitedUser(username, name, password);
          return res.apiv3({ redirectTo: '/' });
        }
        catch (err) {
          // req.flash('warningMessage', req.t('message.failed_to_activate'));
          return res.render('invited');
        }
      }
      else {
        // req.flash('warningMessage', req.t('message.unable_to_use_this_user'));
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
