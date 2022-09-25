import loggerFactory from '~/utils/logger';

import injectUserRegistrationOrderByTokenMiddleware from '../../middlewares/inject-user-registration-order-by-token-middleware';

import g2gTransfer from './g2g-transfer';
import pageListing from './page-listing';
import * as userActivation from './user-activation';

const logger = loggerFactory('growi:routes:apiv3'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();
const routerForAdmin = express.Router();
const routerForAuth = express.Router();

module.exports = (crowi) => {

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
  routerForAdmin.use('/export', require('./export')(crowi));
  routerForAdmin.use('/import', require('./import')(crowi));
  routerForAdmin.use('/search', require('./search')(crowi));
  routerForAdmin.use('/security-setting', require('./security-setting')(crowi));
  routerForAdmin.use('/mongo', require('./mongo')(crowi));
  routerForAdmin.use('/slack-integration-settings', require('./slack-integration-settings')(crowi));
  routerForAdmin.use('/slack-integration-legacy-settings', require('./slack-integration-legacy-settings')(crowi));
  routerForAdmin.use('/activity', require('./activity')(crowi));
  routerForAdmin.use('/g2g-transfer', g2gTransfer(crowi));

  // auth
  routerForAuth.use('/logout', require('./logout')(crowi));


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
  router.get('/check-username', user.api.checkUsername);

  router.post('/complete-registration',
    injectUserRegistrationOrderByTokenMiddleware,
    userActivation.completeRegistrationRules(),
    userActivation.validateCompleteRegistration,
    userActivation.completeRegistrationAction(crowi));

  router.use('/user-ui-settings', require('./user-ui-settings')(crowi));


  return [router, routerForAdmin, routerForAuth];
};
