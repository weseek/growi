const createError = require('http-errors');

module.exports = (crowi, app) => {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');

  return async(req, res, next) => {
    const token = req.params.token || req.body.token;

    if (token == null) {
      return next(createError(400, 'Token not found', { code: 'token-not-found' }));
    }

    const passwordResetOrder = await PasswordResetOrder.findOne({ token });

    // check if the token is valid
    if (passwordResetOrder == null || passwordResetOrder.isExpired() || passwordResetOrder.isRevoked) {
      return next(createError(400, 'passwordResetOrder is null or expired or revoked', { code: 'password-reset-order-is-not-appropriate' }));
    }

    req.passwordResetOrder = passwordResetOrder;

    return next();
  };
};
