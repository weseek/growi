module.exports = function(crowi, app) {
  const actions = {};
  const api = {};
  actions.api = api;

  actions.forgotPassword = async function(req, res) {
    return res.render('forgot-password');
  };

  actions.resetPassword = async function(req, res) {

    const { email } = req.passwordResetOrder;
    return res.render('reset-password', { email });
  };

  actions.error = function(req, res) {
    const { reason } = req.params;

    if (reason === 'password-reset-order') {
      return res.render('forgot-password/error', { reason });
    }
  };

  return actions;
};
