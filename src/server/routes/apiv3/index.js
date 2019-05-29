const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();


module.exports = (crowi) => {
  const middleware = require('../../util/middlewares');
  const { loginRequired, adminRequired, formValid } = middleware;

  const form = require('../../form/apiv3');

  const userGroup = require('./user-group')(crowi);
  const userGroupRelation = require('./user-group-relation')(crowi);

  router.use('/healthcheck', require('./healthcheck')(crowi));

  // user groups
  router.get('/user-groups', loginRequired(crowi), adminRequired(), userGroup.find);
  // router.get('/user-groups/:id', loginRequired(crowi), adminRequired(), adminUserGroup.findOne);
  router.post('/user-groups/create', loginRequired(crowi), adminRequired(), form.userGroup.create, formValid(), userGroup.create);
  // router.post('/user-groups/update/:id', loginRequired(crowi), adminRequired(), adminUserGroup.update);
  router.post('/user-groups/delete/:id', loginRequired(crowi), adminRequired(), form.userGroup.delete, formValid(), userGroup.delete);

  // user group relations
  router.get('/user-group-relations', loginRequired(crowi), adminRequired(), userGroupRelation.find);

  return router;
};
