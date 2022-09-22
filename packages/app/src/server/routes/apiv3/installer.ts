import express, { Request, Router } from 'express';

import { SupportedAction } from '~/interfaces/activity';
import ErrorV3 from '~/server/models/vo/error-apiv3';
import loggerFactory from '~/utils/logger';

import Crowi from '../../crowi';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';
import { registerValidation, registerRules } from '../../middlewares/register-form-validator';
import { InstallerService, FailedToCreateAdminUserError } from '../../service/installer';

import { ApiV3Response } from './interfaces/apiv3-response';


const logger = loggerFactory('growi:routes:apiv3:installer');


type FormRequest = Request & { form: any };

module.exports = (crowi: Crowi): Router => {
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const applicationNotInstalled = require('../../middlewares/application-not-installed')(crowi);

  const activityEvent = crowi.event('activity');

  const router = express.Router();

  // eslint-disable-next-line max-len
  router.post('/', applicationNotInstalled, accessTokenParser, loginRequiredStrictly, adminRequired, registerRules, registerValidation, apiV3FormValidator, async(req: FormRequest, res: ApiV3Response) => {
    const appService = crowi.appService;
    if (appService == null) {
      return res.apiv3Err(new ErrorV3('GROWI cannot be installed due to an internal error', 'app_service_not_setup'), 500);
    }
    const registerForm = req.body.registerForm || {};

    const name = registerForm.name;
    const username = registerForm.username;
    const email = registerForm.email;
    const password = registerForm.password;
    const language = registerForm['app:globalLang'] || 'en_US';

    const installerService = new InstallerService(crowi);

    let adminUser;
    try {
      adminUser = await installerService.install({
        name,
        username,
        email,
        password,
      }, language);
    }
    catch (err) {
      if (err instanceof FailedToCreateAdminUserError) {
        req.form.errors.push(req.t('message.failed_to_create_admin_user', { errMessage: err.message }));
      }
      return res.render('installer');
    }

    await appService.setupAfterInstall();

    // login with passport
    req.logIn(adminUser, (err) => {
      if (err) {
        req.flash('successMessage', req.t('message.complete_to_install1'));
        req.session.redirectTo = '/';
        return res.redirect('/login');
      }

      req.flash('successMessage', req.t('message.complete_to_install2'));

      const parameters = { action: SupportedAction.ACTION_USER_REGISTRATION_SUCCESS };
      activityEvent.emit('update', res.locals.activity._id, parameters);

      return res.redirect('/');
    });
  });

  return router;
};
