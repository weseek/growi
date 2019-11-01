/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:user-group');

const express = require('express');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: CustomizeSetting
 */

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const {
    ErrorV3,
    Config,
  } = crowi.models;

  // TODO writte swagger
  router.put('/layoutTheme', loginRequiredStrictly, adminRequired, csrf, async(req, res) => {
    console.log('here is route');
  });

  return router;
};
