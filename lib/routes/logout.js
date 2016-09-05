module.exports = function(crowi, app) {
  return {
    logout: function(req, res) {

      req.session.destroy();
      return res.redirect('/');
    }
  };
};
