module.exports = (crowi, app) => {

  return (req, res, next) => {
    // check the oneTimeToken is valid
    if (req.token == null /* || token.isExpired() */) {
      return res.redirect('/login');
    }
    return next();
  };
};
