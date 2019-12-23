const loggerFactory = require('@alias/logger');

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:routes:apiv3:notification-setting');

const express = require('express');

const router = express.Router();

// const { body } = require('express-validator/check');

// const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: NotificationSetting
 */
module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { ApiV3FormValidator } = crowi.middlewares;

  // TODO swagger
  router.put('/slack-configuration', loginRequiredStrictly, adminRequired, csrf, ApiV3FormValidator, async(req, res) => {

    const requestParams = {
      'slack:incomingWebhookUrl': req.body.webhookUrl,
      'slack:isIncomingWebhookPrioritized': req.body.isIncomingWebhookPrioritized,
      'slack:token': req.body.slackToken,
    };

    console.log(requestParams);
    return res.apiv3();

  });


  return router;
};
