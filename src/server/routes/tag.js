module.exports = function(crowi, app) {
  'use strict';

  const Tag = crowi.model('Tag');
  const ApiResponse = require('../util/apiResponse');
  const actions = {};
  const api = {};

  actions.api = api;


  /**
   * @api {get} /tags.search search tags
   * @apiName searchTag
   * @apiGroup Tag
   *
   * @apiParam {String} q keyword
   */
  api.search = async function(req, res) {
    let tags = await Tag.find({}).select('-_id name');
    tags = tags.map(tag => tag.name);
    return res.json(ApiResponse.success({tags}));
  };

  return actions;
};
