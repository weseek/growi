module.exports = (crowi, app) => {
  var debug = require('debug')('crowi-plugin:lsx:routes:lsx')
    , path = require('path')
    , url = require('url')
    , Page = crowi.model('Page')
    , LsxPageListRenderer = require('../util/LsxPageListRenderer')
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

  actions.listPages = (req, res) => {
    let user = req.user;
    let fromPagePath = req.query.fromPagePath;
    let args = req.query.args;

    // initialize
    let lsxPrefix = args || fromPagePath;
    let lsxOptions = {};

    // if args is a String like 'key1=value1, key2=value2, ...'
    const splittedArgs = args.split(',');
    if (splittedArgs.length > 1) {
      splittedArgs.forEach((arg) => {
        arg = arg.trim();

        // see https://regex101.com/r/pYHcOM/1
        const match = arg.match(/([^=]+)=?(.+)?/);
        const value = match[2] || true;
        lsxOptions[match[1]] = value;
      });

      // determine prefix
      // 'prefix=foo' pattern or the first argument
      lsxPrefix = lsxOptions.prefix || splittedArgs[0];
    }

    // resolve url
    const pagePath = url.resolve(fromPagePath, lsxPrefix);
    const queryOptions = {}

    // find pages
    Page.generateQueryToListByStartWith(pagePath, user, queryOptions)
      .populate('revision', '-body')  // exclude body
      .exec()
      .then((pages) => {
        res.json(ApiResponse.success({pages}));
      })
      .catch((err) => {
        debug('Error on lsx.listPages', err);
        return res.json(ApiResponse.error(err));
      });
  }

  return actions;
};
