const createError = require('http-errors');

module.exports = (crowi, app) => {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');
  const forgotPassword = require('../routes/forgot-password')(crowi, app);

  return async(req, res, next) => {
    const token = req.params.token || req.body.token;

    if (token == null) {
      return next(createError(400, 'Token not found'));
    }

    const passwordResetOrder = await PasswordResetOrder.findOne({ token });

    // check if the token is valid
    if (passwordResetOrder == null || passwordResetOrder.isExpired() || passwordResetOrder.isRevoked) {
      console.log('bbb');
      const err = 'passwordResetOrder is null or expired or revoked';
      // req.err = err;
      forgotPassword.error(err);
      return next(createError(400, err));
    }

    req.passwordResetOrder = passwordResetOrder;

    return next();
  };
};
