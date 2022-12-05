const { customTagUtils } = require('@growi/core');

const { OptionParser } = customTagUtils;


const DEFAULT_PAGES_NUM = 50;

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
    // when option strings is 'depth=', the option value is true
    if (optionsDepth == null || optionsDepth === true) {
      throw new Error('The value of depth option is invalid.');
    }

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
   * @param {number|string} optionsNum
   * @returns
   *
   * @memberOf Lsx
   */
  static addNumCondition(query, pagePath, optionsNum) {
    // when option strings is 'num=', the option value is true
    if (optionsNum == null || optionsNum === true) {
      throw new Error('The value of num option is invalid.');
    }

    if (typeof optionsNum === 'number') {
      return query.limit(optionsNum);
    }

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
   * add filter condition that filter fetched pages
   *
   * @static
   * @param {any} query
   * @param {any} pagePath
   * @param {any} optionsFilter
   * @param {boolean} isExceptFilter
   * @returns
   *
   * @memberOf Lsx
   */
  static addFilterCondition(query, pagePath, optionsFilter, isExceptFilter = false) {
    // when option strings is 'filter=', the option value is true
    if (optionsFilter == null || optionsFilter === true) {
      throw new Error('filter option require value in regular expression.');
    }

    let filterPath = '';
    if (optionsFilter.charAt(0) === '^') {
      // move '^' to the first of path
      filterPath = new RegExp(`^${pagePath}${optionsFilter.slice(1, optionsFilter.length)}`);
    }
    else {
      filterPath = new RegExp(`^${pagePath}.*${optionsFilter}`);
    }

    if (isExceptFilter) {
      return query.and({
        path: { $not: filterPath },
      });
    }
    return query.and({
      path: filterPath,
    });
  }

  static addExceptCondition(query, pagePath, optionsFilter) {
    return this.addFilterCondition(query, pagePath, optionsFilter, true);
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
  static addSortCondition(query, pagePath, optionsSortArg, optionsReverse) {
    // init sort key
    const optionsSort = optionsSortArg ?? 'path';

    // the default sort order
    const isReversed = optionsReverse === 'true';

    if (optionsSort !== 'path' && optionsSort !== 'createdAt' && optionsSort !== 'updatedAt') {
      throw new Error(`The specified value '${optionsSort}' for the sort option is invalid. It must be 'path', 'createdAt' or 'updatedAt'.`);
    }

    const sortOption = {};
    sortOption[optionsSort] = isReversed ? -1 : 1;
    return query.sort(sortOption);
  }

}

module.exports = (crowi, app) => {
  const Page = crowi.model('Page');
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
    if (builder.addConditionToListOnlyDescendants == null) { // for Backward compatibility (<= GROWI v4.0.x)
      builder.addConditionToListWithDescendants(pagePath);
    }
    else {
      builder.addConditionToListOnlyDescendants(pagePath);
    }

    builder
      .addConditionToExcludeTrashed();

    return Page.addConditionToFilteringByViewerForList(builder, user);
  }

  actions.listPages = async(req, res) => {
    const user = req.user;

    let pagePath;
    let options;

    try {
      pagePath = req.query.pagePath;
      options = JSON.parse(req.query.options);
    }
    catch (error) {
      return res.status(400).send(error);
    }

    const builder = await generateBaseQueryBuilder(pagePath, user);

    // count viewers of `/`
    let toppageViewersCount;
    try {
      const aggRes = await Page.aggregate([
        { $match: { path: '/' } },
        { $project: { count: { $size: '$seenUsers' } } },
      ]);

      toppageViewersCount = aggRes.length > 0
        ? aggRes[0].count
        : 1;
    }
    catch (error) {
      return res.status(500).send(error);
    }

    let query = builder.query;
    try {
      // depth
      if (options.depth != null) {
        query = Lsx.addDepthCondition(query, pagePath, options.depth);
      }
      // filter
      if (options.filter != null) {
        query = Lsx.addFilterCondition(query, pagePath, options.filter);
      }
      if (options.except != null) {
        query = Lsx.addExceptCondition(query, pagePath, options.except);
      }
      // num
      const optionsNum = options.num || DEFAULT_PAGES_NUM;
      query = Lsx.addNumCondition(query, pagePath, optionsNum);
      // sort
      query = Lsx.addSortCondition(query, pagePath, options.sort, options.reverse);

      const pages = await query.exec();
      res.status(200).send({ pages, toppageViewersCount });
    }
    catch (error) {
      return res.status(500).send(error);
    }
  };

  return actions;
};
