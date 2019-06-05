module.exports = function(crowi, app) {

  const Tag = crowi.model('Tag');
  const PageTagRelation = crowi.model('PageTagRelation');
  const ApiResponse = require('../util/apiResponse');
  const actions = {};
  const api = {};

  actions.api = api;

  actions.showPage = function(req, res) {
    return res.render('tags');
  };

  /**
   * @api {get} /tags.search search tags
   * @apiName SearchTag
   * @apiGroup Tag
   *
   * @apiParam {String} q keyword
   */
  api.search = async function(req, res) {
    let tags = await Tag.find({ name: new RegExp(`^${req.query.q}`) }).select('-_id name');
    tags = tags.map((tag) => { return tag.name });
    return res.json(ApiResponse.success({ tags }));
  };

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
    const PageTagRelation = crowi.model('PageTagRelation');
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
