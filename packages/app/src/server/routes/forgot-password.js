module.exports = function(crowi, app) {
  const actions = {};
  const api = {};
  actions.api = api;

  actions.forgotPassword = async function(req, res) {
    return res.render('forgot-password');
  };

  actions.resetPassword = async function(req, res) {
    const { passwordResetOrder } = req;
    return res.render('reset-password', { email: passwordResetOrder.email });
  };

  // middleware to handle error
  actions.handleHttpErrosMiddleware = (error, req, res, next) => {
    if (error != null) {
      return res.render('forgot-password/error', { key: error.code });
    }
    next();
  };

  return actions;
};
