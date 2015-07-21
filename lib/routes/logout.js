module.exports = function(crowi, app) {
  return {
    logout: function(req, res) {

      if (req.facebook) {
        req.facebook.destroySession();
      }

      req.session.destroy();
      return res.redirect('/');
    }
  };
};
