const createError = require('http-errors');

module.exports = (crowi, app) => {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');

  // need refuctoring with http-error by GW-7091

  return async(req, res, next) => {
    const { token } = req.params;
    // if (token == null) {
    //   return res.redirect('/login');
    // }

    if (token == null) {
      return next(createError(400, 'Token not found'));
    }

    const passwordResetOrder = await PasswordResetOrder.findOne({ token });
    // console.log('passwordResetOrder.isRevoked1', passwordResetOrder.isRevoked);

    // if (passwordResetOrder == null || passwordResetOrder.isExpired() || passwordResetOrder.isRevoked) {
    //   console.log('passwordResetOrder.isRevoked2', passwordResetOrder.isRevoked);
    //   return res.redirect('/forgot-password/error/password-reset-order');
    // }

    // check the oneTimeToken is valid
    if (passwordResetOrder == null || passwordResetOrder.isExpired() || passwordResetOrder.isRevoked) {
      return next(createError(400, 'passwordResetOrder is null or expired or revoked'));
    }

    req.DataFromPasswordResetOrderMiddleware = passwordResetOrder;

    return next();
  };
};
