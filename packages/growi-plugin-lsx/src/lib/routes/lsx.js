module.exports = function(crowi, app) {
  var debug = require('debug')('crowi-plugin:lsx:routes:lsx')
    , path = require('path')
    , Page = crowi.model('Page')
    , actions = {};

  actions.renderHtml = function(req, res) {
    var currentPath = req.query.currentPath;
    var args = req.query.args;

    debug(`rendering html for currentPath='${currentPath}', args='${args}'`);

    // TODO try-catch

    // create {Key: Value} Objects
    var splittedArgs = args.split(',');
    var lsxOptions = {};
    splittedArgs.forEach(function(arg) {
      // see https://regex101.com/r/pYHcOM/1
      var match = arg.match(/([^=]+)=?(.+)?/);
      var value = match[2] || true;
      lsxOptions[match[1]] = value;
    });

    // determine prefix
    // 'prefix=foo' pattern or the first argument
    var lsxPrefix = lsxOptions.prefix || splittedArgs[0];
    // resolve path
    var pagePath = path.resolve(currentPath, lsxPrefix);
    var queryOptions = {}

    // find pages
    Page.findListByStartWith(pagePath, req.user, queryOptions)
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
