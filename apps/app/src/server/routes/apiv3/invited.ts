import type { IUser } from '@growi/core/dist/interfaces';
import type { Request, Router } from 'express';
import express from 'express';
import mongoose from 'mongoose';

import loggerFactory from '~/utils/logger';

import type Crowi from '../../crowi';
import { invitedRules, invitedValidation } from '../../middlewares/invited-form-validator';

import type { ApiV3Response } from './interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:login');

type InvitedFormRequest = Request & { form: any, user: any };

module.exports = (crowi: Crowi): Router => {
  const applicationInstalled = require('../../middlewares/application-installed')(crowi);
  const router = express.Router();

  router.post('/', applicationInstalled, invitedRules(), invitedValidation, async(req: InvitedFormRequest, res: ApiV3Response) => {
    if (!req.user) {
      return res.apiv3({ redirectTo: '/login' });
    }

    if (!req.form.isValid) {
      return res.apiv3Err(req.form.errors, 400);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const User = mongoose.model<IUser, any>('User');

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
      logger.debug('username', username);
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
