import Tag from '~/server/models/tag';
import PageTagRelation from '~/server/models/page-tag-relation';

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      Tags:
 *        description: Tags
 *        type: array
 *        items:
 *          $ref: '#/components/schemas/Tag/properties/name'
 *        example: ['daily', 'report', 'tips']
 *
 *      Tag:
 *        description: Tag
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: tag ID
 *            example: 5e2d6aede35da4004ef7e0b7
 *          name:
 *            type: string
 *            description: tag name
 *            example: daily
 *          count:
 *            type: number
 *            description: Count of tagged pages
 *            example: 3
 */
module.exports = function(crowi, app) {

  const ApiResponse = require('../util/apiResponse');
  const actions = {};
  const api = {};

  actions.api = api;

  actions.showPage = function(req, res) {
    return res.render('tags');
  };

  /**
   * @swagger
   *
   *    /tags.search:
   *      get:
   *        tags: [Tags]
   *        operationId: searchTags
   *        summary: /tags.search
   *        description: Search tags
   *        parameters:
   *          - in: query
   *            name: q
   *            schema:
   *              type: string
   *              description: keyword
   *              example: daily
   *            description: keyword to search
   *        responses:
   *          200:
   *            description: Succeeded to tag list.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    tags:
   *                      $ref: '#/components/schemas/Tags'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /tags.search search tags
   * @apiName SearchTag
   * @apiGroup Tag
   *
   * @apiParam {String} q keyword
   */
  api.search = async function(req, res) {
    // https://regex101.com/r/J1cN6O/1
    // prevent from unexpecting attack doing regular expression on tag search (DoS attack)
    // Search for regular expressions as normal characters
    // e.g. user*$ -> user\*\$ (escape a regular expression)
    const escapeRegExp = req.query.q.replace(/[\\^$/.*+?()[\]{}|]/g, '\\$&');
    let tags = await Tag.find({ name: new RegExp(`^${escapeRegExp}`) }).select('_id name');
    tags = tags.map((tag) => { return tag.name });
    return res.json(ApiResponse.success({ tags }));
  };

  /**
   * @swagger
   *
   *    /tags.update:
   *      post:
   *        tags: [Tags]
   *        operationId: updateTag
   *        summary: /tags.update
   *        description: Update tag
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  pageId:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                  tags:
   *                    $ref: '#/components/schemas/Tags'
   *        responses:
   *          200:
   *            description: Succeeded to update tag.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    tags:
   *                      $ref: '#/components/schemas/Tags'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /tags.update update tags on view-mode (not edit-mode)
   * @apiName UpdateTag
   * @apiGroup Tag
   *
   * @apiParam {String} PageId
   * @apiParam {array} tags
   */
  api.update = async function(req, res) {
    const Page = crowi.model('Page');
    const tagEvent = crowi.event('tag');
    const pageId = req.body.pageId;
    const tags = req.body.tags;

    const result = {};
    try {
      // TODO GC-1921 consider permission
      const page = await Page.findById(pageId);
      await PageTagRelation.updatePageTags(pageId, tags);
      result.tags = await PageTagRelation.listTagNamesByPage(pageId);

      tagEvent.emit('update', page, tags);
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
    return res.json(ApiResponse.success(result));
  };

  /**
   * @swagger
   *
   *    /tags.list:
   *      get:
   *        tags: [Tags]
   *        operationId: listTags
   *        summary: /tags.list
   *        description: Get tags
   *        parameters:
   *          - in: query
   *            name: limit
   *            schema:
   *              $ref: '#/components/schemas/V1PaginateResult/properties/meta/properties/limit'
   *          - in: query
   *            name: offset
   *            schema:
   *              $ref: '#/components/schemas/V1PaginateResult/properties/meta/properties/offset'
   *        responses:
   *          200:
   *            description: Succeeded to tag list.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    data:
   *                      type: array
   *                      items:
   *                        $ref: '#/components/schemas/Tag'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /tags.list get tagnames and count pages relate each tag
   * @apiName tagList
   * @apiGroup Tag
   *
   * @apiParam {Number} limit
   * @apiParam {Number} offset
   */
  api.list = async function(req, res) {
    const limit = +req.query.limit || 50;
    const offset = +req.query.offset || 0;
    const sortOpt = { count: -1 };
    const queryOptions = { offset, limit, sortOpt };
    const result = {};

    try {
      // get tag list contains id and count properties
      const listData = await PageTagRelation.createTagListWithCount(queryOptions);
      const ids = listData.list.map((obj) => { return obj._id });

      // get tag documents for add name data to the list
      const tags = await Tag.find({ _id: { $in: ids } });

      // add name property
      result.data = listData.list.map((elm) => {
        const data = {};
        const tag = tags.find((tag) => { return (tag.id === elm._id.toString()) });

        data._id = elm._id;
        data.name = tag.name;
        data.count = elm.count; // the number of related pages
        return data;
      });

      result.totalCount = listData.totalCount;

      return res.json(ApiResponse.success(result));
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
  };


  return actions;
};
