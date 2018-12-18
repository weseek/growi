module.exports = function(crowi, app) {
  'use strict';

  const debug = require('debug')('growi:routes:revision');
  const logger = require('@alias/logger')('growi:routes:revision');
  const Page = crowi.model('Page');
  const Revision = crowi.model('Revision');
  const ApiResponse = require('../util/apiResponse');

  const actions = {};
  actions.api = {};

  /**
   * @api {get} /revisions.get Get revision
   * @apiName GetRevision
   * @apiGroup Revision
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} revision_id Revision Id.
   */
  actions.api.get = async function(req, res) {
    const pageId = req.query.page_id;
    const revisionId = req.query.revision_id;

    if (!pageId || !revisionId) {
      return res.json(ApiResponse.error('Parameter page_id and revision_id are required.'));
    }

    // check whether accessible
    const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user);
    if (!isAccessible) {
      return res.json(ApiResponse.error('Current user is not accessible to this page.'));
    }

    try {
      const revision = await Revision.findById(revisionId).populate('author', 'User');
      return res.json(ApiResponse.success({ revision }));
    }
    catch (err) {
      logger.error('Error revisios.get', err);
      return res.json(ApiResponse.error(err));
    }
  };

  /**
   * @api {get} /revisions.ids Get revision id list of the page
   * @apiName ids
   * @apiGroup Revision
   *
   * @apiParam {String} page_id      Page Id.
   */
  actions.api.ids = function(req, res) {
    const pageId = req.query.page_id || null;

    if (pageId && crowi.isPageId(pageId)) {
      Page.findByIdAndViewer(pageId, req.user)
      .then(function(pageData) {
        debug('Page found', pageData._id, pageData.path);
        return Revision.findRevisionIdList(pageData.path);
      }).then(function(revisions) {
        return res.json(ApiResponse.success({revisions}));
      }).catch(function(err) {
        return res.json(ApiResponse.error(err));
      });
    }
    else {
      return res.json(ApiResponse.error('Parameter error.'));
    }
  };

  /**
   * @api {get} /revisions.list Get revisions
   * @apiName ListRevision
   * @apiGroup Revision
   *
   * @apiParam {String} revision_ids Revision Ids.
   * @apiParam {String} page_id      Page Id.
   */
  actions.api.list = function(req, res) {
    const revisionIds = (req.query.revision_ids || '').split(',');
    const pageId = req.query.page_id || null;

    if (pageId) {
      Page.findByIdAndViewer(pageId, req.user)
      .then(function(pageData) {
        debug('Page found', pageData._id, pageData.path);
        return Revision.findRevisionList(pageData.path, {});
      }).then(function(revisions) {
        return res.json(ApiResponse.success(revisions));
      }).catch(function(err) {
        return res.json(ApiResponse.error(err));
      });
    }
    else if (revisionIds.length > 0) {
      Revision.findRevisions(revisionIds)
      .then(function(revisions) {
        return res.json(ApiResponse.success(revisions));
      }).catch(function(err) {
        return res.json(ApiResponse.error(err));
      });
    }
    else {
      return res.json(ApiResponse.error('Parameter error.'));
    }
  };

  return actions;
};
