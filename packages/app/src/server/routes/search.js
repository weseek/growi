import { SearchDelegatorName } from '~/interfaces/named-query';

const { default: loggerFactory } = require('~/utils/logger');
const { serializeUserSecurely } = require('../models/serializers/user-serializer');

const logger = loggerFactory('growi:routes:search');

/**
 * @swagger
 *
 *   components:
 *     schemas:
 *       ElasticsearchResult:
 *         description: Elasticsearch result v1
 *         type: object
 *         properties:
 *           meta:
 *             type: object
 *             properties:
 *               took:
 *                 type: number
 *                 description: Time Elasticsearch took to execute a search(milliseconds)
 *                 example: 34
 *               total:
 *                 type: number
 *                 description: Number of documents matching search criteria
 *                 example: 2
 *               results:
 *                 type: number
 *                 description: Actual array length of search results
 *                 example: 2
 *
 */
module.exports = function(crowi, app) {
  // var debug = require('debug')('growi:routes:search')
  const Page = crowi.model('Page');
  const User = crowi.model('User');
  const ApiResponse = require('../util/apiResponse');
  const ApiPaginate = require('../util/apiPaginate');

  const actions = {};
  const api = {};

  // TODO: optimize the way to check isReshapable e.g. check data schema of searchResult
  // So far, it determines by delegatorName passed by searchService.searchKeyword
  const checkIsReshapable = (searchResult, delegatorName) => {
    return delegatorName === SearchDelegatorName.DEFAULT;
  };

  const reshapeSearchResult = async(searchResult, delegatorName) => {
    if (!checkIsReshapable(searchResult, delegatorName)) {
      return searchResult;
    }

    const result = {};

    // create score map for sorting
    // key: id , value: score
    const scoreMap = {};
    for (const esPage of searchResult.data) {
      scoreMap[esPage._id] = esPage._score;
    }

    const ids = searchResult.data.map((page) => { return page._id });
    const findResult = await Page.findListByPageIds(ids);

    // add tags data to page
    findResult.pages.map((pageData) => {
      const data = searchResult.data.find((data) => {
        return pageData.id === data._id;
      });
      pageData._doc.tags = data._source.tag_names;
      return pageData;
    });

    result.meta = searchResult.meta;
    result.totalCount = findResult.totalCount;
    result.data = findResult.pages
      .map((pageData) => {
        if (pageData.lastUpdateUser != null && pageData.lastUpdateUser instanceof User) {
          pageData.lastUpdateUser = serializeUserSecurely(pageData.lastUpdateUser);
        }

        const data = searchResult.data.find((data) => {
          return pageData.id === data._id;
        });

        const pageMeta = {
          bookmarkCount: data._source.bookmark_count || 0,
          elasticSearchResult: data.elasticSearchResult,
        };

        return { pageData, pageMeta };
      })
      .sort((page1, page2) => {
        // note: this do not consider NaN
        return scoreMap[page2._id] - scoreMap[page1._id];
      });

    return result;
  };

  actions.searchPage = function(req, res) {
    const keyword = req.query.q || null;

    return res.render('search', {
      q: keyword,
    });
  };

  /**
   * @swagger
   *
   *   /search:
   *     get:
   *       tags: [Search, CrowiCompatibles]
   *       operationId: searchPages
   *       summary: /search
   *       description: Search pages
   *       parameters:
   *         - in: query
   *           name: q
   *           schema:
   *             type: string
   *             description: keyword
   *             example: daily report
   *           required: true
   *         - in: query
   *           name: path
   *           schema:
   *             $ref: '#/components/schemas/Page/properties/path'
   *         - in: query
   *           name: offset
   *           schema:
   *             $ref: '#/components/schemas/V1PaginateResult/properties/meta/properties/offset'
   *         - in: query
   *           name: limit
   *           schema:
   *             $ref: '#/components/schemas/V1PaginateResult/properties/meta/properties/limit'
   *       responses:
   *         200:
   *           description: Succeeded to get list of pages.
   *           content:
   *             application/json:
   *               schema:
   *                 properties:
   *                   ok:
   *                     $ref: '#/components/schemas/V1Response/properties/ok'
   *                   meta:
   *                     $ref: '#/components/schemas/ElasticsearchResult/properties/meta'
   *                   totalCount:
   *                     type: integer
   *                     description: total count of pages
   *                     example: 35
   *                   data:
   *                     type: array
   *                     items:
   *                       $ref: '#/components/schemas/Page'
   *                     description: page list
   *         403:
   *           $ref: '#/components/responses/403'
   *         500:
   *           $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /search search page
   * @apiName Search
   * @apiGroup Search
   *
   * @apiParam {String} q keyword
   * @apiParam {String} path
   * @apiParam {String} offset
   * @apiParam {String} limit
   */
  api.search = async function(req, res) {
    const user = req.user;
    const { q: keyword = null, type = null } = req.query;
    let paginateOpts;

    try {
      paginateOpts = ApiPaginate.parseOptionsForElasticSearch(req.query);
    }
    catch (e) {
      res.json(ApiResponse.error(e));
    }

    if (keyword === null || keyword === '') {
      return res.json(ApiResponse.error('keyword should not empty.'));
    }

    const { searchService } = crowi;
    if (!searchService.isReachable) {
      return res.json(ApiResponse.error('SearchService is not reachable.'));
    }

    let userGroups = [];
    if (user != null) {
      const UserGroupRelation = crowi.model('UserGroupRelation');
      userGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
    }

    const searchOpts = { ...paginateOpts, type };

    let _searchResult;
    let delegatorName;
    try {
      [_searchResult, delegatorName] = await searchService.searchKeyword(keyword, user, userGroups, searchOpts); // TODO: separate when not full-text search
    }
    catch (err) {
      logger.error('Failed to search', err);
      return res.json(ApiResponse.error(err));
    }

    let result;
    try {
      const searchResult = searchService.formatResult(_searchResult);
      result = await reshapeSearchResult(searchResult, delegatorName);
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
    return res.json(ApiResponse.success(result));
  };

  actions.api = api;
  return actions;
};
