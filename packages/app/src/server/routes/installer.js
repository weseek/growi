import { SupportedAction } from '~/interfaces/activity';
import loggerFactory from '~/utils/logger';

import { InstallerService, FailedToCreateAdminUserError } from '../service/installer';

const logger = loggerFactory('growi:routes:installer');

module.exports = function(crowi) {

  const actions = {};

  const activityEvent = crowi.event('activity');

  actions.index = function(req, res) {
    return res.render('installer');
  };

  actions.install = async function(req, res, next) {
    const registerForm = req.body.registerForm || {};

    if (!req.form.isValid) {
      return res.render('installer');
    }

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

    const appService = crowi.appService;
    appService.setupAfterInstall();

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
  };

  return actions;
};
