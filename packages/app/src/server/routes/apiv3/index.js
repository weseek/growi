import loggerFactory from '~/utils/logger';

import injectUserRegistrationOrderByTokenMiddleware from '../../middlewares/inject-user-registration-order-by-token-middleware';

import pageListing from './page-listing';
import * as userActivation from './user-activation';

const logger = loggerFactory('growi:routes:apiv3'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();
const routerForAdminAndAuth = express.Router();

module.exports = (crowi) => {

  // add custom functions to express response
  require('./response')(express, crowi);

  routerForAdminAndAuth.use('/healthcheck', require('./healthcheck')(crowi));

  // admin
  routerForAdminAndAuth.use('/admin-home', require('./admin-home')(crowi));
  routerForAdminAndAuth.use('/markdown-setting', require('./markdown-setting')(crowi));
  routerForAdminAndAuth.use('/app-settings', require('./app-settings')(crowi));
  routerForAdminAndAuth.use('/customize-setting', require('./customize-setting')(crowi));
  routerForAdminAndAuth.use('/notification-setting', require('./notification-setting')(crowi));
  routerForAdminAndAuth.use('/users', require('./users')(crowi));
  routerForAdminAndAuth.use('/user-groups', require('./user-group')(crowi));
  routerForAdminAndAuth.use('/export', require('./export')(crowi));
  routerForAdminAndAuth.use('/import', require('./import')(crowi));
  routerForAdminAndAuth.use('/search', require('./search')(crowi));
  routerForAdminAndAuth.use('/security-setting', require('./security-setting')(crowi));
  routerForAdminAndAuth.use('/mongo', require('./mongo')(crowi));
  routerForAdminAndAuth.use('/slack-integration-settings', require('./slack-integration-settings')(crowi));
  routerForAdminAndAuth.use('/slack-integration-legacy-settings', require('./slack-integration-legacy-settings')(crowi));
  routerForAdminAndAuth.use('/logout', require('./logout')(crowi));


  router.use('/in-app-notification', require('./in-app-notification')(crowi));

  router.use('/personal-setting', require('./personal-setting')(crowi));

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
  router.get('/check_username', user.api.checkUsername);

  router.post('/complete-registration',
    injectUserRegistrationOrderByTokenMiddleware,
    userActivation.completeRegistrationRules(),
    userActivation.validateCompleteRegistration,
    userActivation.completeRegistrationAction(crowi));

  router.use('/user-ui-settings', require('./user-ui-settings')(crowi));


  return [router, routerForAdminAndAuth];
};
