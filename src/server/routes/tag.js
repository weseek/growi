module.exports = function(crowi, app) {

  const Tag = crowi.model('Tag');
  const PageTagRelation = crowi.model('PageTagRelation');
  const ApiResponse = require('../util/apiResponse');
  const actions = {};
  const api = {};

  actions.api = api;


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
   * @api {get} /tags.get get page tags
   * @apiName GetTag
   * @apiGroup Tag
   *
   * @apiParam {String} pageId
   */
  api.get = async function(req, res) {
    let tags = await PageTagRelation.find({ relatedPage: req.query.pageId }).populate('relatedTag').select('-_id relatedTag');
    tags = tags.map((tag) => { return tag.relatedTag.name });
    return res.json(ApiResponse.success({ tags }));
  };

  return actions;
};
