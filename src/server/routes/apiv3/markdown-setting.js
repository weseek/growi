const loggerFactory = require('@alias/logger');

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:routes:apiv3:user-group');

const express = require('express');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: MarkDownSetting
 */

module.exports = (crowi) => {
  // const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  // const adminRequired = require('../../middleware/admin-required')(crowi);

  // const {
  //   Config,
  // } = crowi.models;

  return router;
};
