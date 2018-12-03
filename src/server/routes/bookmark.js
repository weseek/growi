module.exports = function(crowi, app) {
  'use strict';

  const debug = require('debug')('growi:routes:bookmark');
  const Bookmark = crowi.model('Bookmark');
  const Page = crowi.model('Page');
  const ApiResponse = require('../util/apiResponse');
  const ApiPaginate = require('../util/apiPaginate');
  let actions = {};
  actions.api = {};

  /**
   * @api {get} /bookmarks.get Get bookmark of the page with the user
   * @apiName GetBookmarks
   * @apiGroup Bookmark
   *
   * @apiParam {String} page_id Page Id.
   */
  actions.api.get = function(req, res) {
    let pageId = req.query.page_id;

    Bookmark.findByPageIdAndUserId(pageId, req.user)
      .then(function(data) {
        debug('bookmark found', pageId, data);
        let result = {};

        result.bookmark = data;
        return res.json(ApiResponse.success(result));
      })
      .catch(function(err) {
        return res.json(ApiResponse.error(err));
      });
  };

  /**
   *
   */
  actions.api.list = function(req, res) {
    let paginateOptions = ApiPaginate.parseOptions(req.query);

    let options = Object.assign(paginateOptions, { populatePage: true });
    Bookmark.findByUserId(req.user._id, options)
      .then(function(result) {
        return res.json(ApiResponse.success(result));
      })
      .catch(function(err) {
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
  actions.api.add = async function(req, res) {
    const pageId = req.body.page_id;

    const page = await Page.findByIdAndViewer(pageId, req.user);
    if (page == null) {
      return res.json(ApiResponse.success({ bookmark: null }));
    }

    const bookmark = await Bookmark.add(page, req.user);

    bookmark.depopulate('page');
    bookmark.depopulate('user');
    const result = { bookmark };

    return res.json(ApiResponse.success(result));
  };

  /**
   * @api {post} /bookmarks.remove Remove bookmark of the page
   * @apiName RemoveBookmark
   * @apiGroup Bookmark
   *
   * @apiParam {String} page_id Page Id.
   */
  actions.api.remove = function(req, res) {
    let pageId = req.body.page_id;

    Bookmark.removeBookmark(pageId, req.user)
      .then(function(data) {
        debug('Bookmark removed.', data); // if the bookmark is not exists, this 'data' is null
        return res.json(ApiResponse.success());
      })
      .catch(function(err) {
        return res.json(ApiResponse.error(err));
      });
  };

  return actions;
};
