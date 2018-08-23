module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('growi:routes:bookmark')
    , Bookmark = crowi.model('Bookmark')
    , Page = crowi.model('Page')
    , User = crowi.model('User')
    , Revision = crowi.model('Revision')
    , Bookmark = crowi.model('Bookmark')
    , ApiResponse = require('../util/apiResponse')
    , actions = {}
  ;
  actions.api = {};

  /**
   * @api {get} /bookmarks.get Get bookmark of the page with the user
   * @apiName GetBookmarks
   * @apiGroup Bookmark
   *
   * @apiParam {String} page_id Page Id.
   */
  actions.api.get = function(req, res) {
    var pageId = req.query.page_id;

    Bookmark.findByPageIdAndUserId(pageId, req.user)
    .then(function(data) {
      debug('bookmark found', pageId, data);
      var result = {};
      if (data) {
      }

      result.bookmark = data;
      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      return res.json(ApiResponse.error(err));
    });
  };

  /**
   * @api {post} /bookmarks.add Add bookmark of the page
   * @apiName AddBookmark
   * @apiGroup Bookmark
   *
   * @apiParam {String} page_id Page Id.
   */
  actions.api.add = function(req, res) {
    var pageId = req.body.page_id;

    Page.findPageByIdAndGrantedUser(pageId, req.user)
    .then(function(pageData) {
      if (pageData) {
        return Bookmark.add(pageData, req.user);
      }
      else {
        return res.json(ApiResponse.success({bookmark: null}));
      }
    }).then(function(data) {
      var result = {};
      data.depopulate('page');
      data.depopulate('user');

      result.bookmark = data;
      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      return res.json(ApiResponse.error(err));
    });
  };

  /**
   * @api {post} /bookmarks.remove Remove bookmark of the page
   * @apiName RemoveBookmark
   * @apiGroup Bookmark
   *
   * @apiParam {String} page_id Page Id.
   */
  actions.api.remove = function(req, res) {
    var pageId = req.body.page_id;

    Bookmark.removeBookmark(pageId, req.user)
    .then(function(data) {
      debug('Bookmark removed.', data); // if the bookmark is not exists, this 'data' is null
      return res.json(ApiResponse.success());
    }).catch(function(err) {
      return res.json(ApiResponse.error(err));
    });
  };


  return actions;
};
