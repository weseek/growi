import loggerFactory from '~/utils/logger';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';
import injectUserRegistrationOrderByTokenMiddleware from '../../middlewares/inject-user-registration-order-by-token-middleware';
import * as loginFormValidator from '../../middlewares/login-form-validator';
import * as registerFormValidator from '../../middlewares/register-form-validator';

import g2gTransfer from './g2g-transfer';
import importRoute from './import';
import pageListing from './page-listing';
import * as userActivation from './user-activation';

const logger = loggerFactory('growi:routes:apiv3'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();
const routerForAdmin = express.Router();
const routerForAuth = express.Router();

module.exports = (crowi, app) => {
  const isInstalled = crowi.configManager.getConfig('crowi', 'app:installed');

  // add custom functions to express response
  require('./response')(express, crowi);

  routerForAdmin.use('/healthcheck', require('./healthcheck')(crowi));

  // admin
  routerForAdmin.use('/admin-home', require('./admin-home')(crowi));
  routerForAdmin.use('/markdown-setting', require('./markdown-setting')(crowi));
  routerForAdmin.use('/app-settings', require('./app-settings')(crowi));
  routerForAdmin.use('/customize-setting', require('./customize-setting')(crowi));
  routerForAdmin.use('/notification-setting', require('./notification-setting')(crowi));
  routerForAdmin.use('/users', require('./users')(crowi));
  routerForAdmin.use('/user-groups', require('./user-group')(crowi));
  routerForAdmin.use('/external-user-groups', require('./external-user-group')(crowi));
  routerForAdmin.use('/export', require('./export')(crowi));
  routerForAdmin.use('/import', importRoute(crowi));
  routerForAdmin.use('/search', require('./search')(crowi));
  routerForAdmin.use('/security-setting', require('./security-setting')(crowi));
  routerForAdmin.use('/mongo', require('./mongo')(crowi));
  routerForAdmin.use('/slack-integration-settings', require('./slack-integration-settings')(crowi));
  routerForAdmin.use('/slack-integration-legacy-settings', require('./slack-integration-legacy-settings')(crowi));
  routerForAdmin.use('/activity', require('./activity')(crowi));
  routerForAdmin.use('/g2g-transfer', g2gTransfer(crowi));

  // auth
  const applicationInstalled = require('../../middlewares/application-installed')(crowi);
  const addActivity = generateAddActivityMiddleware(crowi);
  const login = require('../login')(crowi, app);
  const loginPassport = require('../login-passport')(crowi, app);

  routerForAuth.post('/login', applicationInstalled, loginFormValidator.loginRules(), loginFormValidator.loginValidation,
    addActivity, loginPassport.injectRedirectTo, loginPassport.isEnableLoginWithLocalOrLdap, loginPassport.loginWithLocal, loginPassport.loginWithLdap,
    loginPassport.cannotLoginErrorHadnler, loginPassport.loginFailure);

  routerForAuth.use('/invited', require('./invited')(crowi));
  routerForAuth.use('/logout', require('./logout')(crowi));

  routerForAuth.post('/register',
    applicationInstalled, registerFormValidator.registerRules(), registerFormValidator.registerValidation, addActivity, login.register);

  routerForAuth.post('/user-activation/register', applicationInstalled, userActivation.registerRules(),
    userActivation.validateRegisterForm, userActivation.registerAction(crowi));

  // installer
  if (!isInstalled) {
    routerForAdmin.use('/installer', require('./installer')(crowi));
    return [router, routerForAdmin, routerForAuth];
  }

  router.use('/in-app-notification', require('./in-app-notification')(crowi));

  router.use('/personal-setting', require('./personal-setting')(crowi));

  router.use('/user-group-relations', require('./user-group-relation')(crowi));
  router.use('/user-group-relations', require('./user-group-relation')(crowi));

  router.use('/statistics', require('./statistics')(crowi));


  router.use('/search', require('./search')(crowi));

  router.use('/page', require('./page')(crowi));
  router.use('/pages', require('./pages')(crowi));
  router.use('/revisions', require('./revisions')(crowi));

  router.use('/page-listing', pageListing(crowi));

  router.use('/share-links', require('./share-links')(crowi));

  router.use('/bookmarks', require('./bookmarks')(crowi));
  router.use('/attachment', require('./attachment')(crowi));

  router.use('/slack-integration', require('./slack-integration')(crowi));

  router.use('/staffs', require('./staffs')(crowi));

  router.use('/forgot-password', require('./forgot-password')(crowi));

  const user = require('../user')(crowi, null);
  router.get('/check-username', user.api.checkUsername);

  router.post('/complete-registration',
    addActivity,
    injectUserRegistrationOrderByTokenMiddleware,
    userActivation.completeRegistrationRules(),
    userActivation.validateCompleteRegistration,
    userActivation.completeRegistrationAction(crowi));

  router.use('/plugins', require('./plugins')(crowi));

  router.use('/user-ui-settings', require('./user-ui-settings')(crowi));

  router.use('/bookmark-folder', require('./bookmark-folder')(crowi));
  router.use('/questionnaire', require('~/features/questionnaire/server/routes/apiv3/questionnaire')(crowi));

  return [router, routerForAdmin, routerForAuth];
};
