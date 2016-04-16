module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('crowi:routes:revision')
    , Revision = crowi.model('Revision')
    , ApiResponse = require('../util/apiResponse')
    , actions = {}
  ;
  actions.api = {};

  /**
   * @api {get} /revision.get Get revision
   * @apiName GetRevision
   * @apiGroup Revision
   *
   * @apiParam {String} revision_id Revision Id.
   */
  actions.api.get = function(req, res) {
    var revisionId = req.query.revision_id;

    Revision
      .findRevision(revisionId)
      .then(function(revisionData) {
        return res.json(ApiResponse.success(revisionData));
      })
      .catch(function(err) {
        return res.json(ApiResponse.error(err));
      });
  };

  /**
   * @api {get} /revision.list Get revisions
   * @apiName ListRevision
   * @apiGroup Revision
   *
   * @apiParam {String} revision_id Revision Id.
   */
  actions.api.list = function(req, res) {
    var revisionIds = req.query.revision_ids.split(',');

    var promises = [];
    revisionIds.forEach(function(id) {
      promises.push(Revision.findRevision(id));
    });

    Promise.all(promises)
      .then(function(results) {
        return res.json(ApiResponse.success(results));
      })
      .catch(function(err) {
        return res.json(ApiResponse.error(err));
      });
  };

  return actions;
};
