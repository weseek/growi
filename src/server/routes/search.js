module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('growi:routes:search')
    , Page = crowi.model('Page')
    , User = crowi.model('User')
    , ApiResponse = require('../util/apiResponse')

    , actions = {};
  var api = actions.api = {};

  actions.searchPage = function(req, res) {
    var keyword = req.query.q || null;
    var search = crowi.getSearcher();
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
   */
  api.search = function(req, res) {
    var keyword = req.query.q || null;
    var tree = req.query.tree || null;
    if (keyword === null || keyword === '') {
      return res.json(ApiResponse.error('keyword should not empty.'));
    }

    var search = crowi.getSearcher();
    if (!search) {
      return res.json(ApiResponse.error('Configuration of ELASTICSEARCH_URI is required.'));
    }


    var doSearch;
    if (tree) {
      doSearch = search.searchKeywordUnderPath(keyword, tree, {});
    }
    else {
      doSearch = search.searchKeyword(keyword, {});
    }
    var result = {};
    doSearch
      .then(function(data) {
        result.meta = data.meta;

        return Page.populatePageListToAnyObjects(data.data);
      }).then(function(pages) {
        result.data = pages.filter(function(page) {
          if (Object.keys(page).length < 12) { // FIXME: 12 is a number of columns.
            return false;
          }
          return true;
        });
        return res.json(ApiResponse.success(result));
      })
      .catch(function(err) {
        return res.json(ApiResponse.error(err));
      });
  };


  return actions;
};
