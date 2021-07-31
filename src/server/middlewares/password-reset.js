module.exports = (crowi, app) => {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');

  return async(req, res, next) => {
    const { token, email } = req.query;

    const passwordResetOrder = await PasswordResetOrder.findOne({ token, email });
    // check the oneTimeToken is valid
    if (passwordResetOrder == null || passwordResetOrder.isExpired()) {
      return res.redirect('/login');
    }

    return next();
  };
};
