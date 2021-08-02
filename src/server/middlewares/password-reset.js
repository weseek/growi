module.exports = (crowi, app) => {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');

  return async(req, res, next) => {
    const { token } = req.params;

    if (token == null) {
      return res.redirect('/login');
    }

    const passwordResetOrder = await PasswordResetOrder.findOne({ token });
    // check the oneTimeToken is valid
    if (passwordResetOrder == null || passwordResetOrder.isExpired()) {
      return res.redirect('/login/error/passwordResetOrder');
    }

    req.DataFromPasswordResetOrderMiddleware = passwordResetOrder;

    return next();
  };
};
