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
  api.search = function(req, res) {
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
    let doSearch;
    if (tree) {
      doSearch = search.searchKeywordUnderPath(keyword, tree, searchOpts);
    }
    else {
      doSearch = search.searchKeyword(keyword, searchOpts);
    }
    const result = {};
    doSearch
      .then(function(data) {
        result.meta = data.meta;
        result.searchResult = data.data;

        return Page.populatePageListToAnyObjects(data.data);
      })
      .then(function(pages) {
        result.data = pages
          .filter(page => {
            if (Object.keys(page).length < 12) {
              // FIXME: 12 is a number of columns.
              return false;
            }
            return true;
          })
          .map(page => {
            return { ...page, bookmarkCount: (page._source && page._source.bookmark_count) || 0 };
          });
        return res.json(ApiResponse.success(result));
      })
      .catch(function(err) {
        return res.json(ApiResponse.error(err));
      });
  };

  return actions;
};
