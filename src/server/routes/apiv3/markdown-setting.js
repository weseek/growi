/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:user-group');

const express = require('express');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: MarkDownSetting
 */

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);

  const {
    ErrorV3,
    Config,
  } = crowi.models;

  // TODO swagger
  router.put('/xss', loginRequiredStrictly, adminRequired, async(req, res) => {
    const array = req.body;

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('markdown', array);
      return res.apiv3({ array });
    }
    catch (err) {
      const msg = 'Error occurred in updating xss';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'update-xss-failed'));
    }

  });

  return router;
};
