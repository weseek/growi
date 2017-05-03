const debug = require('debug')('crowi-plugin:lsx:routes:lsx');
const OptionParser = require('../util/option-parser');

class Lsx {

  static addDepthCondition(query, optionDepth) {
    return query.and({
      // TODO implement
      // path: new RegExp('...')
    })
  }

}

module.exports = (crowi, app) => {
  var Page = crowi.model('Page')
    , ApiResponse = crowi.require('../util/apiResponse')
    , actions = {};

  actions.listPages = (req, res) => {
    let user = req.user;
    let pagePath = req.query.pagePath;
    let options = JSON.parse(req.query.options);

    // find pages
    let query = Page.generateQueryToListByStartWith(pagePath, user, {})
      .populate('revision', '-body');  // exclude body

    // depth
    if (options.depth !== undefined) {
      query = Lsx.addDepthCondition(query, options.depth);
    }

    query.exec()
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
