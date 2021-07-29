module.exports = (crowi, app) => {
  const PasswordResetOrder = crowi.model('PasswordResetOrder');

  return async(req, res, next) => {
    const { token } = req.query;

    const passwordResetOrder = await PasswordResetOrder.findOne({ token });

    if (passwordResetOrder == null) {
      return res.redirect('/login');
    }


    // check the oneTimeToken is valid
    if (token == null || passwordResetOrder.isExpired()) {
      // return res.redirect('/login');
      return res.redirect('/login');
    }

    return next();
  };
};
