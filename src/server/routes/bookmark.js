/**
 * @swagger
 *  tags:
 *    name: Bookmarks
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      Bookmark:
 *        description: Bookmark
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: page ID
 *            example: 5e07345972560e001761fa63
 *          __v:
 *            type: number
 *            description: DB record version
 *            example: 0
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 *          page:
 *            $ref: '#/components/schemas/Page/properties/_id'
 *          user:
 *            $ref: '#/components/schemas/User/properties/_id'
 */

module.exports = function(crowi, app) {
  const debug = require('debug')('growi:routes:bookmark');
  const Bookmark = crowi.model('Bookmark');
  const Page = crowi.model('Page');
  const ApiResponse = require('../util/apiResponse');
  const ApiPaginate = require('../util/apiPaginate');
  const actions = {};
  actions.api = {};

  /**
   * @swagger
   *
   *    /bookmarks.get:
   *      get:
   *        tags: [Bookmarks, CrowiCompatibles]
   *        operationId: getBookmark
   *        summary: /bookmarks.get
   *        description: Get bookmark of the page with the user
   *        parameters:
   *          - in: query
   *            name: page_id
   *            required: true
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *        responses:
   *          200:
   *            description: Succeeded to get bookmark of the page with the user.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    bookmark:
   *                      $ref: '#/components/schemas/Bookmark'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /bookmarks.get Get bookmark of the page with the user
   * @apiName GetBookmarks
   * @apiGroup Bookmark
   *
   * @apiParam {String} page_id Page Id.
   */
  actions.api.get = function(req, res) {
    const pageId = req.query.page_id;

    Bookmark.findByPageIdAndUserId(pageId, req.user)
      .then((data) => {
        debug('bookmark found', pageId, data);
        const result = {};

        result.bookmark = data;
        return res.json(ApiResponse.success(result));
      })
      .catch((err) => {
        return res.json(ApiResponse.error(err));
      });
  };

  actions.api.list = function(req, res) {
    const paginateOptions = ApiPaginate.parseOptions(req.query);

    const options = Object.assign(paginateOptions, { populatePage: true });
    Bookmark.findByUserId(req.user._id, options)
      .then((result) => {
        return res.json(ApiResponse.success(result));
      })
      .catch((err) => {
        return res.json(ApiResponse.error(err));
      });
  };

  /**
   * @swagger
   *
   *    /bookmarks.add:
   *      post:
   *        tags: [Bookmarks, CrowiCompatibles]
   *        operationId: addBookmark
   *        summary: /bookmarks.add
   *        description: Add bookmark of the page
   *        parameters:
   *          - in: query
   *            name: page_id
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *            required: true
   *        responses:
   *          200:
   *            description: Succeeded to add bookmark of the page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    bookmark:
   *                      $ref: '#/components/schemas/Bookmark'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
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
   * @swagger
   *
   *    /bookmarks.remove:
   *      post:
   *        tags: [Bookmarks, CrowiCompatibles]
   *        operationId: removeBookmark
   *        summary: /bookmarks.remove
   *        description: Remove bookmark of the page
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  page_id:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                required:
   *                  - page_id
   *        responses:
   *          200:
   *            description: Succeeded to remove bookmark of the page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /bookmarks.remove Remove bookmark of the page
   * @apiName RemoveBookmark
   * @apiGroup Bookmark
   *
   * @apiParam {String} page_id Page Id.
   */
  actions.api.remove = function(req, res) {
    const pageId = req.body.page_id;

    Bookmark.removeBookmark(pageId, req.user)
      .then((data) => {
        debug('Bookmark removed.', data); // if the bookmark is not exists, this 'data' is null
        return res.json(ApiResponse.success());
      })
      .catch((err) => {
        return res.json(ApiResponse.error(err));
      });
  };

  return actions;
};
