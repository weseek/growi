const mongoose = require('mongoose');

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


  async function sendPasswordResetEmail() {

    return mailService.send({
      to: 'hoge@gmail.com',
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
    const oneTimeToken = await PasswordResetOrder.generateOneTimeToken();
    await sendPasswordResetEmail();
    return;
  };


  return actions;
};
