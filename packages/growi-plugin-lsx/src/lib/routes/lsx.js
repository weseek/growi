module.exports = (crowi, app) => {
  var debug = require('debug')('crowi-plugin:lsx:routes:lsx')
    , path = require('path')
    , LsxPageListRenderer = require('../util/Lsx')
    , lsx = new LsxPageListRenderer(crowi, app)
    , ApiResponse = crowi.require('../util/apiResponse')
    , actions = {};

  actions.renderHtml = (req, res) => {
    lsx.renderHtml(req.user, req.query.fromPagePath, req.query.args)
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
