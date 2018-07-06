module.exports = function(crowi, app) {
  'use strict';

  const debug = require('debug')('growi:routs:comment')
    , Comment = crowi.model('Comment')
    , Page = crowi.model('Page')
    , ApiResponse = require('../util/apiResponse')
    , actions = {}
    , api = {};

  actions.api = api;

  /**
   * @api {get} /comments.get Get comments of the page of the revision
   * @apiName GetComments
   * @apiGroup Comment
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} revision_id Revision Id.
   */
  api.get = function(req, res) {
    const pageId = req.query.page_id;
    const revisionId = req.query.revision_id;

    if (revisionId) {
      return Comment.getCommentsByRevisionId(revisionId)
        .then(function(comments) {
          res.json(ApiResponse.success({comments}));
        }).catch(function(err) {
          res.json(ApiResponse.error(err));
        });
    }

    return Comment.getCommentsByPageId(pageId)
      .then(function(comments) {
        res.json(ApiResponse.success({comments}));
      }).catch(function(err) {
        res.json(ApiResponse.error(err));
      });
  };

  /**
   * @api {post} /comments.add Post comment for the page
   * @apiName PostComment
   * @apiGroup Comment
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} revision_id Revision Id.
   * @apiParam {String} comment Comment body
   * @apiParam {Number} comment_position=-1 Line number of the comment
   */
  api.add = async function(req, res) {
    const form = req.form.commentForm;

    if (!req.form.isValid) {
      // return res.json(ApiResponse.error('Invalid comment.'));
      return res.json(ApiResponse.error('コメントを入力してください。'));
    }

    const pageId = form.page_id;
    const revisionId = form.revision_id;
    const comment = form.comment;
    const position = form.comment_position || -1;
    const isMarkdown = form.is_markdown;

    const createdComment = await Comment.create(pageId, req.user._id, revisionId, comment, position, isMarkdown)
      .catch(function(err) {
        return res.json(ApiResponse.error(err));
      });

    // update page
    await Page.findOneAndUpdate({ _id: pageId }, {
      lastUpdateUser: req.user,
      updatedAt: new Date()
    });

    return res.json(ApiResponse.success({comment: createdComment}));
    // NOTIFICATION: send comment notification here
  };

  /**
   * @api {post} /comments.remove Remove specified comment
   * @apiName RemoveComment
   * @apiGroup Comment
   *
   * @apiParam {String} comment_id Comment Id.
   */
  api.remove = function(req, res) {
    const commentId = req.body.comment_id;
    if (!commentId) {
      return Promise.resolve(res.json(ApiResponse.error('\'comment_id\' is undefined')));
    }

    return Comment.findById(commentId).exec()
      .then(function(comment) {
        return comment.remove()
        .then(function() {
          return Page.updateCommentCount(comment.page);
        })
        .then(function() {
          return res.json(ApiResponse.success({}));
        });
      })
      .catch(function(err) {
        return res.json(ApiResponse.error(err));
      });

  };

  return actions;
};
