module.exports = function(crowi, app) {
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
      to: 'kaori@weseek.co.jp',
      subject: 'forgotPasswordMailTest',
      template: path.join(crowi.localeDir, 'en_US/notifications/passwordReset.txt'),
      // TODO: need to set appropriate values by GW-6828
      // vars: {
      //   appTitle: appService.getAppTitle(),
      //   email: 'kaori@weseek.co.jp',
      //   url: 'https://www.google.com/',
      // },
    });
  }

  api.post = async function(req, res) {
    await sendPasswordResetEmail();
    return;
  };


  return actions;
};
