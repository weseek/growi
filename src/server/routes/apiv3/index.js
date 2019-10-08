const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

module.exports = (crowi) => {
  router.use('/healthcheck', require('./healthcheck')(crowi));

  router.use('/mongo', require('./mongo')(crowi));

  router.use('/export', require('./export')(crowi));

  router.use('/import', require('./import')(crowi));

  router.use('/statistics', require('./statistics')(crowi));

  return router;
};
