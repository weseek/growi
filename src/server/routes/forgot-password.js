module.exports = function(crowi, app) {
  const { appService, mailService } = crowi;
  const path = require('path');
  const actions = {};
  const api = {};
  actions.api = api;

  actions.forgotPassword = async function(req, res) {
    return res.render('forgot-password');
  };


  async function sendPasswordResetEmail() {
    // send mails to all admin users (derived from crowi) -- 2020.06.18 Yuki Takei
    // const appTitle = appService.getAppTitle();

    return mailService.send({
      to: 'kaori@weseek.co.jp',
      subject: 'forgotPasswordMailTest',
      template: path.join(crowi.localeDir, 'en_US/notifications/passwordReset.txt'),
    });
  }

  api.get = async function(req, res) {
    await sendPasswordResetEmail();

    return;
  };


  return actions;
};
