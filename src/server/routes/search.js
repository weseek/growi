module.exports = function(crowi, app) {
  'use strict';

  // var debug = require('debug')('growi:routes:search')
  const Page = crowi.model('Page');
  const ApiResponse = require('../util/apiResponse');
  const ApiPaginate = require('../util/apiPaginate');
  const actions = {};
  const api = (actions.api = {});

  actions.searchPage = function(req, res) {
    const keyword = req.query.q || null;
    const search = crowi.getSearcher();
    if (!search) {
      return res.json(ApiResponse.error('Configuration of ELASTICSEARCH_URI is required.'));
    }

    return res.render('search', {
      q: keyword,
    });
  };

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
    const { q: keyword = null, tree = null, type = null } = req.query;
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

    const search = crowi.getSearcher();
    if (!search) {
      return res.json(ApiResponse.error('Configuration of ELASTICSEARCH_URI is required.'));
    }

    const searchOpts = { ...paginateOpts, type };

    const result = {};
    try {
      let esResult;
      if (tree) {
        esResult = await search.searchKeywordUnderPath(keyword, tree, searchOpts);
      }
      else {
        esResult = await search.searchKeyword(keyword, searchOpts);
      }

      const findResult = await Page.findListByPageIds(esResult.data, { limit: 50 });

      result.meta = esResult.meta;
      result.totalCount = findResult.totalCount;
      result.data = findResult.pages
        .map(page => {
          page.bookmarkCount = (page._source && page._source.bookmark_count) || 0;
          return page;
        });
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }

    return res.json(ApiResponse.success(result));
  };

  return actions;
};
