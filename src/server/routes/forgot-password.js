const logger = require('@alias/logger')('growi:routes:forgot-password');
const ApiResponse = require('../util/apiResponse');

module.exports = function(crowi, app) {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');
  const User = crowi.model('User');
  const { appService, mailService, configManager } = crowi;
  const path = require('path');
  const actions = {};
  const api = {};
  actions.api = api;

  actions.forgotPassword = async function(req, res) {
    return res.render('forgot-password');
  };

  actions.resetPassword = async function(req, res) {

    const { email } = req.DataFromPasswordResetOrderMiddleware;
    return res.render('reset-password', { email });
  };

  async function sendPasswordResetEmail(email, url, i18n) {
    return mailService.send({
      to: email,
      subject: 'Password Reset',
      template: path.join(crowi.localeDir, `${i18n}/notifications/passwordReset.txt`),
      vars: {
        appTitle: appService.getAppTitle(),
        email,
        url,
      },
    });
  }

  api.post = async function(req, res) {
    const { email } = req.body;
    const grobalLang = configManager.getConfig('crowi', 'app:globalLang');
    const i18n = req.language || grobalLang;
    const appUrl = appService.getSiteUrl();

    try {
      const passwordResetOrderData = await PasswordResetOrder.createPasswordResetOrder(email);
      const url = new URL(`/forgot-password/${passwordResetOrderData.token}`, appUrl);
      const oneTimeUrl = url.href;
      await sendPasswordResetEmail(email, oneTimeUrl, i18n);
      return res.json(ApiResponse.success());
    }
    catch (err) {
      const msg = 'Error occurred during password reset request procedure';
      logger.error(err);
      return res.json(ApiResponse.error(msg));
    }
  };

  actions.error = function(req, res) {
    const { reason } = req.params;

    if (reason === 'password-reset-order') {
      return res.render('forgot-password/error', { reason });
    }
  };


  api.put = async(req, res) => {
    const { email, newPassword } = req.body.params;

    //  findOne User
    const user = User.findOne({ email });

    // if (user.isPasswordSet() && !user.isPasswordValid(oldPassword)) {
    //   return res.apiv3Err('wrong-current-password', 400);
    // }
    try {
      const userData = await user.updatePassword(newPassword);
      return res.apiv3({ userData });
    }
    catch (err) {
      logger.error(err);
      return res.json(ApiResponse.error('update-password-failed'));
    }
  };


  return actions;
};
