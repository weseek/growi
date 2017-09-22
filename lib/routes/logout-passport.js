module.exports = function(crowi, app) {
  return {
    logout: (req, res) => {
      req.logout();
      return res.redirect('/');
    }
  };
};
