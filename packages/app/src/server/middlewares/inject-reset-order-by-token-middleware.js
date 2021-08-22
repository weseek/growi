const createError = require('http-errors');

module.exports = (crowi, app) => {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');

  // need refuctoring with http-error by GW-7091

  return async(req, res, next) => {
    const { token } = req.params;

    if (token == null) {
      res.redirect('/login');
      return next(createError(400, 'Token not found'));
    }

    const passwordResetOrder = await PasswordResetOrder.findOne({ token });

    // check if the token is valid
    if (passwordResetOrder == null || passwordResetOrder.isExpired() || passwordResetOrder.isRevoked) {
      res.redirect('/forgot-password/error/password-reset-order');
      return next(createError(400, 'passwordResetOrder is null or expired or revoked'));
    }

    req.passwordResetOrder = passwordResetOrder;

    return next();
  };
};
