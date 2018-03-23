const debug = require('debug')('growi-plugin:lsx:routes:lsx');
const OptionParser = require('../util/option-parser');

class Lsx {

  /**
   * add depth condition that limit fetched pages
   *
   * @static
   * @param {any} query
   * @param {any} pagePath
   * @param {any} optionsDepth
   * @returns
   *
   * @memberOf Lsx
   */
  static addDepthCondition(query, pagePath, optionsDepth) {
    const range = OptionParser.parseRange(optionsDepth);
    const start = range.start;
    const end = range.end;

    if (start < 1 || end < 1) {
      throw new Error(`specified depth is [${start}:${end}] : start and end are must be larger than 1`);
    }

    // count slash
    const slashNum = pagePath.split('/').length - 1;
    const depthStart = slashNum;            // start is not affect to fetch page
    const depthEnd = slashNum + end - 1;

    return query.and({
      path: new RegExp(`^(\\/[^\\/]*){${depthStart},${depthEnd}}$`)
    });
  }

  /**
   * add num condition that limit fetched pages
   *
   * @static
   * @param {any} query
   * @param {any} pagePath
   * @param {any} optionsNum
   * @returns
   *
   * @memberOf Lsx
   */
  static addNumCondition(query, pagePath, optionsNum) {
    const range = OptionParser.parseRange(optionsNum);
    const start = range.start;
    const end = range.end;

    if (start < 1 || end < 1) {
      throw new Error(`specified num is [${start}:${end}] : start and end are must be larger than 1`);
    }

    const skip = start - 1;
    const limit = end - skip;

    return query.skip(skip).limit(limit);
  }

  /**
   * add reverse condition that sort pages
   *
   * @static
   * @param {any} query
   * @param {string} pagePath
   * @param {string} optionsSort
   * @param {string} optionsReverse
   * @returns
   *
   * @memberOf Lsx
   */
  static addSortCondition(query, pagePath, optionsSort, optionsReverse) {
    let isReversed = false

    if (optionsReverse != null) {
      if (optionsReverse !== 'true' && optionsReverse !== 'false') {
        throw new Error(`specified reverse is '${optionsReverse}' : reverse are must be 'true' or 'false'`);
      }
      isReversed = (optionsReverse === 'true');
    }

    let sortOption = {};
    sortOption[optionsSort] = isReversed ? -1 : 1;
    return query.sort(sortOption);
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
    let query = (Page.generateQueryToListWithDescendants != null)
      ? Page.generateQueryToListWithDescendants(pagePath, user, {})     // defined above crowi-plus v2.0.8
                                                                        //   1. `/` will be added to the end of `path`
                                                                        //   2. the regex strings included in `path` will be escaped
      : Page.generateQueryToListByStartWith(pagePath, user, {});        // for Backward compatibility (<= crowi-plus v2.0.7)

    // exclude body
    query = query.populate('revision', '-body');

    try {
      // depth
      if (options.depth != null) {
        query = Lsx.addDepthCondition(query, pagePath, options.depth);
      }
      // num
      if (options.num != null) {
        query = Lsx.addNumCondition(query, pagePath, options.num);
      }
      // sort order
      query = Lsx.addSortCondition(query, pagePath, 'path', options.reverse);
    }
    catch (error) {
      return res.json(ApiResponse.error(error.message));
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
