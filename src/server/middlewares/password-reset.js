module.exports = (crowi, app) => {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');

  return (req, res, next) => {
    // const { token } = req.params;
    const { token } = req.query;
    const passwordResetOrder = PasswordResetOrder.findOne({ token });

    // http://localhost:3000/forgot-password/token?token=hoge

    // check the oneTimeToken is valid
    if (token == null || passwordResetOrder.isExpired()) {
      // return res.redirect('/login');
      return res.redirect('/login');
    }

    return next();
  };
};
