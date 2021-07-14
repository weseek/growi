module.exports = function(crowi, app) {
  const ApiResponse = require('../util/apiResponse');

  const actions = {};
  const api = {};

  /*
   TODO: add swagger
  */

  // api.get = async function(req, res) {
  //   return res.json(ApiResponse.success('hoge'));
  // };

  actions.forgotpassword = async function(req, res) {
    return res.json(ApiResponse.success('hogesss'));
    // return res.redirect('/password');
  };

  actions.api = api;
  return actions;
};
