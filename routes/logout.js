module.exports = function(app) {
  return {
    logout: function(req, res) {

      req.facebook.destroySession();
      req.session.destroy();

      return res.redirect('/');
    }
  };
};
