module.exports = function(crowi, app) {
  const actions = {};
  const api = {};
  actions.api = api;

  actions.forgotPassword = async function(req, res) {
    return res.render('forgot-password');
  };

  actions.resetPassword = async function(req, res) {
    const { error, passwordResetOrder } = req;

    if (error != null) {
      return res.render('forgot-password/error', { key: error.key });
    }

    return res.render('reset-password', { email: passwordResetOrder.email });
  };

  return actions;
};
