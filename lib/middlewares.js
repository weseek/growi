exports.adminRequired = function() {
  return function(req, res, next) {
    if (req.user && '_id' in req.user) {
      if (req.user.admin) {
        next();
        return;
      }
      return res.redirect('/');
    }
    return res.redirect('/login');
  };
};

exports.loginRequired = function() {
  return function(req, res, next) {
    if (req.user && '_id' in req.user) {
      // TODO 移行おわったら削除
      if (req.user.email && !req.user.password && req.route.path != '/me/password') {
        return res.redirect('/me/password');
      }

      return next();
    }
    req.session.jumpTo = req.originalUrl;
    return res.redirect('/login');
  };
};
