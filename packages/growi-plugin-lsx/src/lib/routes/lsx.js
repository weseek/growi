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
   * add sort condition(sort key & sort order)
   *
   * If only the reverse option is specified, the sort key is 'path'.
   * If only the sort key is specified, the sort order is the ascending order.
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
    // the default sort key
    if (optionsSort == null) {
      optionsSort = 'path';
    }

    // the default sort order
    let isReversed = false;

    if (optionsSort != null) {
      if (optionsSort !== 'path' && optionsSort !== 'createdAt' && optionsSort !== 'updatedAt') {
        throw new Error(`The specified value '${optionsSort}' for the sort option is invalid. It must be 'path', 'createdAt' or 'updatedAt'.`);
      }
    }

    if (optionsReverse != null) {
      if (optionsReverse !== 'true' && optionsReverse !== 'false') {
        throw new Error(`The specified value '${optionsReverse}' for the reverse option is invalid. It must be 'true' or 'false'.`);
      }
      isReversed = (optionsReverse === 'true');
    }

    let sortOption = {};
    sortOption[optionsSort] = isReversed ? -1 : 1;
    return query.sort(sortOption);
  }
}

module.exports = (crowi, app) => {
  const Page = crowi.model('Page')
    , ApiResponse = crowi.require('../util/apiResponse')
    , actions = {};

  /**
   *
   * @param {*} pagePath
   * @param {*} user
   *
   * @return {Promise<Query>} query
   */
  function generateBaseQueryBuilder(pagePath, user) {
    let baseQuery = Page.find();
    if (Page.PageQueryBuilder == null) {
      if (Page.generateQueryToListWithDescendants != null) {  // for Backward compatibility (<= GROWI v3.2.x)
        baseQuery = Page.generateQueryToListWithDescendants(pagePath, user, {});
      }
      else if (Page.generateQueryToListByStartWith != null) { // for Backward compatibility (<= crowi-plus v2.0.7)
        baseQuery = Page.generateQueryToListByStartWith(pagePath, user, {});
      }
    }

    const builder = new Page.PageQueryBuilder(baseQuery);
    builder.addConditionToListWithDescendants(pagePath, {})
      .addConditionToExcludeTrashed()
      .addConditionToExcludeRedirect();

    let promisifiedBuilder = Promise.resolve(builder);

    // add grant conditions
    if (user != null) {
      const UserGroupRelation = crowi.model('UserGroupRelation');
      promisifiedBuilder = UserGroupRelation.findAllUserGroupIdsRelatedToUser(user)
        .then(userGroups => {
          return builder.addConditionToFilteringByViewer(user, userGroups);
        });
    }

    return promisifiedBuilder;
  }

  actions.listPages = (req, res) => {
    let user = req.user;
    let pagePath = req.query.pagePath;
    let options = JSON.parse(req.query.options);

    generateBaseQueryBuilder(pagePath, user)
      .then(builder => {
        let query = builder.query;
        try {
          // depth
          if (options.depth != null) {
            query = Lsx.addDepthCondition(query, pagePath, options.depth);
          }
          // num
          if (options.num != null) {
            query = Lsx.addNumCondition(query, pagePath, options.num);
          }
          // sort
          query = Lsx.addSortCondition(query, pagePath, options.sort, options.reverse);
        }
        catch (error) {
          return res.json(ApiResponse.error(error.message));
        }
        return query.exec();
      })
      .then(pages => {
        res.json(ApiResponse.success({pages}));
      })
      .catch((err) => {
        debug('Error on lsx.listPages', err);
        return res.json(ApiResponse.error(err));
      });
  };

  return actions;
};
