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

  router.post('/', applicationInstalled, invitedRules(), invitedValidation, async(req: InvitedFormRequest, res: ApiV3Response) => {
    if (!req.user) {
      return res.apiv3({ redirectTo: '/login' });
    }

    if (!req.form.isValid) {
      return res.apiv3Err(req.form.errors, 400);
    }

    const user = req.user;
    const invitedForm = req.form.invitedForm || {};
    const username = invitedForm.username;
    const name = invitedForm.name;
    const password = invitedForm.password;

    // check user upper limit
    const isUserCountExceedsUpperLimit = await User.isUserCountExceedsUpperLimit();
    if (isUserCountExceedsUpperLimit) {
      return res.apiv3Err('message.can_not_activate_maximum_number_of_users', 403);
    }

    const creatable = await User.isRegisterableUsername(username);
    if (!creatable) {
      debug('username', username);
      return res.apiv3Err('message.unable_to_use_this_user', 403);
    }

    try {
      await user.activateInvitedUser(username, name, password);
      return res.apiv3({ redirectTo: '/' });
    }
    catch (err) {
      return res.apiv3Err('message.failed_to_activate', 403);
    }
  });

  return router;
};
