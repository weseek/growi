const mongoose = require('mongoose');

const logger = require('@alias/logger')('growi:routes:forgot-password');
const ApiResponse = require('../util/apiResponse');

module.exports = function(crowi, app) {
  const PasswordResetOrder = mongoose.model('PasswordResetOrder');
  const { /* appService, */ mailService } = crowi;
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


  async function sendPasswordResetEmail() {

    return mailService.send({
      to: 'hoge@example.com',
      subject: 'forgotPasswordMailTest',
      // TODO: apply i18n by GW-6833
      template: path.join(crowi.localeDir, 'en_US/notifications/passwordReset.txt'),
      // TODO: need to set appropriate values by GW-6828
      // vars: {
      //   appTitle: appService.getAppTitle(),
      //   email: 'hoge@gmail.com',
      //   url: 'https://www.google.com/',
      // },
    });
  }

  api.post = async function(req, res) {
    const token = await PasswordResetOrder.generateUniqueOneTimeToken();
    const email = 'hoge@example.com';

    try {
      await PasswordResetOrder.create({ email, token });
      res.send(ApiResponse.success({ email, token }));
    }
    catch (err) {
      const msg = 'Error occurred during password reset request procedure';
      logger.error(err);
      return res.json(ApiResponse.error(msg));
    }

    await sendPasswordResetEmail();
    return;
  };


  return actions;
};
