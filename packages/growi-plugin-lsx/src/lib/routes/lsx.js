module.exports = (crowi, app) => {
  var debug = require('debug')('crowi-plugin:lsx:routes:lsx')
    , path = require('path')
    , Lsx = require('../util/Lsx')
    , lsx = new Lsx(crowi, app)
    , actions = {};

  actions.renderHtml = (req, res) => {
    var currentPath = req.query.currentPath;
    var args = req.query.args;

    lsx.renderHtml
      .then((html) => {
        res.send(html);
      })
      .catch((err) => {
        debug('Error on rendering lsx.renderHtml', err);
        res.send(err);
      });
  }

  return actions;
};
