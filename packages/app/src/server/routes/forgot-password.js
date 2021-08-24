module.exports = function(crowi, app) {
  const actions = {};
  const api = {};
  actions.api = api;

  actions.forgotPassword = async function(req, res) {
    return res.render('forgot-password');
  };

  actions.resetPassword = async function(req, res) {

    if (req.error != null) {
      // if (req.error === 'Token not found') {
      //   return res.json({ status: 404, error: req.error });
      // }
      const error = 'password-reset-order';
      return res.render('forgot-password/error', { reason: error });

      // if (req.error === 'passwordResetOrder is null or expired or revoked') {
      //   return res.json({ status: 400, error: req.error });
      // }
    }

    console.log('req.passwordResetOrder', req.passwordResetOrder);

    const { email } = req.passwordResetOrder;

    return res.render('reset-password', { email });
  };

  return actions;
};
