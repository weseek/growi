const { customTagUtils } = require('growi-commons');

const { OptionParser } = customTagUtils;

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
    const depthStart = slashNum; // start is not affect to fetch page
    const depthEnd = slashNum + end - 1;

    return query.and({
      path: new RegExp(`^(\\/[^\\/]*){${depthStart},${depthEnd}}$`),
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
  static addSortCondition(query, pagePath, optionsSort = 'path', optionsReverse) {
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

    const sortOption = {};
    sortOption[optionsSort] = isReversed ? -1 : 1;
    return query.sort(sortOption);
  }

}

module.exports = (crowi, app) => {
  const Page = crowi.model('Page');
  const ApiResponse = crowi.require('../util/apiResponse');
  const actions = {};

  /**
   *
   * @param {*} pagePath
   * @param {*} user
   *
   * @return {Promise<Query>} query
   */
  async function generateBaseQueryBuilder(pagePath, user) {
    let baseQuery = Page.find();
    if (Page.PageQueryBuilder == null) {
      if (Page.generateQueryToListWithDescendants != null) { // for Backward compatibility (<= GROWI v3.2.x)
        baseQuery = Page.generateQueryToListWithDescendants(pagePath, user, {});
      }
      else if (Page.generateQueryToListByStartWith != null) { // for Backward compatibility (<= crowi-plus v2.0.7)
        baseQuery = Page.generateQueryToListByStartWith(pagePath, user, {});
      }

      // return dummy PageQueryBuilder object
      return Promise.resolve({ query: baseQuery });
    }

    const builder = new Page.PageQueryBuilder(baseQuery);
    builder.addConditionToListWithDescendants(pagePath, {})
      .addConditionToExcludeTrashed()
      .addConditionToExcludeRedirect();

    let promisifiedBuilder = Promise.resolve(builder);

    if (user != null) {
      const UserGroupRelation = crowi.model('UserGroupRelation');
      const userGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
      promisifiedBuilder = builder.addConditionToFilteringByViewer(user, userGroups);
    }

    return promisifiedBuilder;
  }

  actions.listPages = async(req, res) => {
    const user = req.user;
    const pagePath = req.query.pagePath;
    const options = JSON.parse(req.query.options);

    const builder = await generateBaseQueryBuilder(pagePath, user);

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

      const pages = await query.exec();
      res.json(ApiResponse.success({ pages }));
    }
    catch (error) {
      return res.json(ApiResponse.error(error));
    }
  };

  return actions;
};
