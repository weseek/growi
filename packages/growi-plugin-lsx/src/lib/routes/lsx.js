module.exports = (crowi, app) => {
  var debug = require('debug')('crowi-plugin:lsx:routes:lsx')
    , Page = crowi.model('Page')
    , ApiResponse = crowi.require('../util/apiResponse')
    , actions = {};

  actions.listPages = (req, res) => {
    let user = req.user;
    let pagePath = req.query.pagePath;
    let queryOptions = req.query.queryOptions;

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
