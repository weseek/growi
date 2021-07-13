const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

module.exports = (crowi) => {

  // add custom functions to express response
  require('./response')(express, crowi);

  router.use('/healthcheck', require('./healthcheck')(crowi));

  // admin
  router.use('/admin-home', require('./admin-home')(crowi));
  router.use('/markdown-setting', require('./markdown-setting')(crowi));
  router.use('/app-settings', require('./app-settings')(crowi));
  router.use('/customize-setting', require('./customize-setting')(crowi));
  router.use('/notification-setting', require('./notification-setting')(crowi));
  router.use('/users', require('./users')(crowi));
  router.use('/user-groups', require('./user-group')(crowi));
  router.use('/export', require('./export')(crowi));
  router.use('/import', require('./import')(crowi));
  router.use('/search', require('./search')(crowi));

  router.use('/personal-setting', require('./personal-setting')(crowi));

  router.use('/user-group-relations', require('./user-group-relation')(crowi));

  router.use('/mongo', require('./mongo')(crowi));

  router.use('/statistics', require('./statistics')(crowi));

  router.use('/security-setting', require('./security-setting')(crowi));

  router.use('/search', require('./search')(crowi));

  router.use('/page', require('./page')(crowi));
  router.use('/pages', require('./pages')(crowi));
  router.use('/revisions', require('./revisions')(crowi));

  router.use('/share-links', require('./share-links')(crowi));

  router.use('/bookmarks', require('./bookmarks')(crowi));
  router.use('/attachment', require('./attachment')(crowi));

  router.use('/slack-integration', require('./slack-integration')(crowi));
  router.use('/slack-integration-settings', require('./slack-integration-settings')(crowi));
  router.use('/staffs', require('./staffs')(crowi));
  router.use('/password', require('./password')(crowi));

  return router;
};
