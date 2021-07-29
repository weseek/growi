module.exports = (crowi, app) => {

  return (req, res, next) => {
    // const { token } = req.params;
    const { token } = req.query;
    // check the oneTimeToken is valid

    // http://localhost:3000/forgot-password/token?token=hoge
    if (token == null /* || token.isExpired() */) {
      console.log('req.queryがほげ');
      // return res.redirect('/login');
      return res.redirect('/login');
    }
    return next();
  };
};
