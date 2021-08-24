const createError = require('http-errors');

module.exports = (crowi, app) => {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');
  const forgotPassword = require('../routes/forgot-password')(crowi, app);

  return async(req, res, next) => {
    const token = req.params.token || req.body.token;

    if (token == null) {
      req.error = { key: 'token-not-found', message: 'Token not found' };
    }

    const passwordResetOrder = await PasswordResetOrder.findOne({ token });

    // check if the token is valid
    if (passwordResetOrder == null || passwordResetOrder.isExpired() || passwordResetOrder.isRevoked) {
      req.error = { key: 'password-reset-order-is-not-appropriate', message: 'passwordResetOrder is null or expired or revoked' };
    }

    req.passwordResetOrder = passwordResetOrder;

    return next();
  };
};
