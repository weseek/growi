module.exports = function(crowi, app) {

  const Tag = crowi.model('Tag');
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
   * @api {get} /tags.list get tagnames and count pages relate each tag
   * @apiName tagList
   * @apiGroup Tag
   */
  api.list = async function(req, res) {
    const PageTagRelation = crowi.model('PageTagRelation');

    const tags = await Tag.find();
    const result = [];

    try {
      /* eslint-disable no-await-in-loop */
      for (const tag of tags) {
        const data = {};
        data.tagName = tag.name;
        data.countPage = await PageTagRelation.count({ relatedTag: tag.id });
        result.push(data);
      }
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }

    return res.json(ApiResponse.success({ result }));
  };


  return actions;
};
