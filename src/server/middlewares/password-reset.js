module.exports = (crowi, app) => {

  return (req, res, next) => {
    const { value } = req.query;
    // check the oneTimeToken is valid

    // http://localhost:3000/forgot-password/token?value=hoge
    if (value === 'hoge' /* || token.isExpired() */) {
      console.log('req.queryがほげ');
      // return res.redirect('/login');
      return res.redirect('/login/error/registered');
    }
    return next();
  };
};
