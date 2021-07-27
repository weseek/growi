const logger = require('@alias/logger')('growi:routes:forgot-password');
const ApiResponse = require('../util/apiResponse');

module.exports = function(crowi, app) {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');
  const { /* appService, */ mailService, configManager } = crowi;
  const path = require('path');
  const actions = {};
  const api = {};
  actions.api = api;

  actions.forgotPassword = async function(req, res) {
    return res.render('forgot-password');
  };

  actions.resetPassword = async function(req, res) {
    return res.render('reset-password');
  };


  async function sendPasswordResetEmail(i18n) {

    return mailService.send({
      to: 'hoge@example.com',
      subject: 'forgotPasswordMailTest',
      template: path.join(crowi.localeDir, `${i18n}/notifications/passwordReset.txt`),
      // TODO: need to set appropriate values by GW-6828
      // vars: {
      //   appTitle: appService.getAppTitle(),
      //   email: 'hoge@gmail.com',
      //   url: 'https://www.google.com/',
      // },
    });
  }

  api.post = async function(req, res) {
    // const email = 'hoge@example.com';
    try {
      const token = await PasswordResetOrder.generateUniqueOneTimeToken();
      console.log('token.hoge', token);
      // await passwordResetOrder.save({ email });
      res.send(ApiResponse.success());
    }
    catch (err) {
      const msg = 'Error occurred during password reset request procedure';
      logger.error(err);
      return res.json(ApiResponse.error(msg));
    }

    const grobalLang = configManager.getConfig('crowi', 'app:globalLang');
    const i18n = req.language || grobalLang;

    await sendPasswordResetEmail(i18n);
    return;
  };


  return actions;
};
