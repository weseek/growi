module.exports = (crowi, app) => {
  var debug = require('debug')('crowi-plugin:lsx:routes:lsx')
    , path = require('path')
    , LsxPageListRenderer = require('../util/Lsx')
    , lsx = new LsxPageListRenderer(crowi, app)
    , ApiResponse = crowi.require('../util/apiResponse')
    , actions = {};

  actions.renderHtml = (req, res) => {
    var currentPath = req.query.currentPath;
    var args = req.query.args;

    lsx.renderHtml(req.user, currentPath, args)
      .then((html) => {
        return res.json(ApiResponse.success({html}));
      })
      .catch((err) => {
        debug('Error on rendering lsx.renderHtml', err);
        return res.json(ApiResponse.error(err));
      });
  }

  return actions;
};
