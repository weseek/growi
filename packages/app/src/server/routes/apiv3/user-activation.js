import rateLimit from 'express-rate-limit';

import ErrorV3 from '~/server/models/vo/error-apiv3';
import injectResetOrderByTokenMiddleware from '~/server/middlewares/inject-reset-order-by-token-middleware';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:userActivation'); // eslint-disable-line no-unused-vars

const express = require('express');
const { body } = require('express-validator');
const { serializeUserSecurely } = require('../../models/serializers/user-serializer');

const router = express.Router();

module.exports = (crowi) => {
  const { configManager } = crowi;
  const User = crowi.model('User');
  const UserRegistrationOrder = crowi.model('UserRegistrationOrder');
  const csrf = require('../../middlewares/csrf')(crowi);

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message:
      'Too many requests were sent from this IP. Please try a password reset request again on the password reset request form',
  });

  // Sleep test
  async function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
  }

  router.put('/', injectResetOrderByTokenMiddleware, async(req, res) => {

    console.log('grunelog URL token action');
    await sleep(3000);
    return res.apiv3({ userData: 'grune test response OK' });

    /*
    const { userActivation } = req;
    const { token, email } = userActivation;
    const grobalLang = configManager.getConfig('crowi', 'app:globalLang');
    const i18n = req.language || grobalLang;
    const { newPassword } = req.body;

    // TODO: grune - add condition for UserRegistrationOrder
    const user = await User.findOne({ email });

    // when the user is not found or active
    if (user == null || user.status !== 2) {
      return res.apiv3Err('update-password-failed');
    }

    try {
      const userData = await user.updatePassword(newPassword);
      const serializedUserData = serializeUserSecurely(userData);
      // passwordResetOrder.revokeOneTimeToken();
      // await sendPasswordResetEmail('passwordResetSuccessful', i18n, email);
      return res.apiv3({ userData: serializedUserData });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err('update-password-failed');
    }
    */
  });

  // middleware to handle error
  router.use((error, req, res, next) => {
    if (error != null) {
      return res.apiv3Err(new ErrorV3(error.message, error.code));
    }
    next();
  });

  return router;
};
