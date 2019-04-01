module.exports = function(crowi, app) {

  const Tag = crowi.model('Tag');
  const ApiResponse = require('../util/apiResponse');
  const actions = {};
  const api = {};

  actions.api = api;

  actions.showPage = function(req, res) {
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

  return actions;
};
