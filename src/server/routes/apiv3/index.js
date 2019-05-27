const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();


module.exports = (crowi) => {
  const middleware = require('../../util/middlewares');
  const { loginRequired, adminRequired } = middleware;
  const { userGroup: adminUserGroup } = require('./admin')(crowi);

  router.use('/healthcheck', require('./healthcheck')(crowi));

  router.get('/user-groups', loginRequired(crowi), adminRequired(), adminUserGroup.find);

  return router;
};
