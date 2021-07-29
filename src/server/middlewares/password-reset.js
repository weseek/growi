module.exports = (crowi, app) => {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');

  return async(req, res, next) => {
    const { token } = req.query;

    const passwordResetOrder = await PasswordResetOrder.findOne({ token });
    console.log('passwordResetOrder', passwordResetOrder);

    if (passwordResetOrder == null) {
      return res.redirect('/login');
    }

    // http://localhost:3000/forgot-password/token?token=hoge

    // check the oneTimeToken is valid
    if (token == null || passwordResetOrder.isExpired()) {
      // return res.redirect('/login');
      return res.redirect('/login');
    }

    return next();
  };
};
