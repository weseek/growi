module.exports = function(crowi, app) {
  var debug = require('debug')('crowi-plugin:lsx:routes:lsx')
    , Page = crowi.model('Page')
    , actions = {};

  actions.renderHtml = function(req, res) {
    debug(`rendering html for '${path}'`);

    var path = '/Level2/';
    var queryOptions = {};

    // find pages
    Page.findListByStartWith(path, req.user, queryOptions)
      .then(function(pages) {
        var renderVars = {};
        renderVars.pages = pages;
        renderVars.pager = false
        renderVars.viewConfig = {};

        // render widget
        res.render('widget/page_list', renderVars);
      })
      .catch(function(err) {
        debug('Error on rendering lsx.renderHtml', err);
      });
  }

  return actions;
};
