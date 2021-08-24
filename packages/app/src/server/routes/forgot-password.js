
module.exports = function(crowi, app) {

  const actions = {};
  const api = {};
  actions.api = api;

  actions.forgotPassword = async function(req, res) {
    return res.render('forgot-password');
  };

  actions.resetPassword = async function(req, res) {

    if (req.error != null) {
      return res.render('forgot-password/error', { key: req.error.key });
    }

    console.log('req.passwordResetOrder', req.passwordResetOrder);

    const { email } = req.passwordResetOrder;

    return res.render('reset-password', { email });
  };

  return actions;
};
