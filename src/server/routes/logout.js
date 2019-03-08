module.exports = function(crowi, app) {
  return {
    logout(req, res) {
      req.session.destroy();
      return res.redirect('/');
    },
  };
};
