module.exports = function(crowi, app) {
  return {
    logout(req, res) {
      req.session.destroy();

      // redirect
      const redirectTo = req.headers.referer || '/';
      return res.safeRedirect(redirectTo);
    },
  };
};
