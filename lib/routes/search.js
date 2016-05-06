module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('crowi:routes:search')
    , Page = crowi.model('Page')
    , User = crowi.model('User')
    , ApiResponse = require('../util/apiResponse')

    , sprintf = require('sprintf')

    , actions = {};
  var api = actions.api = {};

  actions.searchPage = function(req, res) {
    var search = crowi.getSearcher();
    if (!search) {
      return res.json(ApiResponse.error('Configuration of ELASTICSEARCH_URI is required.'));
    }
  };

  /**
   * @api {get} /search search page
   * @apiName Search
   * @apiGroup Search
   *
   * @apiParam {String} q keyword
   * @apiParam {String} path
   */
  api.search = function(req, res){
    var keyword = req.query.q || null;
    if (keyword === null || keyword === '') {
      return res.json(ApiResponse.error('keyword should not empty.'));
    }

    var search = crowi.getSearcher();
    if (!search) {
      return res.json(ApiResponse.error('Configuration of ELASTICSEARCH_URI is required.'));
    }

    var result = {};
    search.searchKeyword(keyword, {})
      .then(function(data) {
        result.meta = data.meta;

        return Page.populatePageListToAnyObjects(data.data);
      }).then(function(pages) {
        result.data = pages;
        return res.json(ApiResponse.success(result));
      })
      .catch(function(err) {
        return res.json(ApiResponse.error(err));
      });
  };


  return actions;
};
