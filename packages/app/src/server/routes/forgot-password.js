module.exports = function(crowi, app) {
  const actions = {};
  const api = {};
  actions.api = api;

  actions.forgotPassword = async function(req, res) {
    return res.render('forgot-password');
  };

  actions.resetPassword = async function(req, res) {

    if (req.error != null) {
      return res.render('forgot-password/error', { reason: 'password-reset-order' });
      // if (req.error === 'token-not-found') {
      //   return res.json({ status: 404, error: passwordResetOrder.message });
      // }

      // if (req.error === 'password-reset-order-is-not-appropriate') {
      //   return res.json({ status: 400, error: passwordResetOrder.message });
      // }
    }

    console.log('req.passwordResetOrder', req.passwordResetOrder);

    const { email } = req.passwordResetOrder;

    return res.render('reset-password', { email });
  };

  return actions;
};
