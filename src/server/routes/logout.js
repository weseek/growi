const { URL } = require('url');

module.exports = function(crowi, app) {
  return {
    logout(req, res) {
      req.session.destroy();

      // parse referer url
      const referer = new URL(req.headers.referer);
      // redirect
      return res.redirect(`${referer.pathname}${referer.search}${referer.hash}`);
    },
  };
};
