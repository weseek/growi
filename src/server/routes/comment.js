module.exports = function(crowi, app) {
  'use strict';

  const logger = require('@alias/logger')('growi:routes:comment')
    , Comment = crowi.model('Comment')
    , User = crowi.model('User')
    , Page = crowi.model('Page')
    , ApiResponse = require('../util/apiResponse')
    , globalNotificationService = crowi.getGlobalNotificationService()
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
  api.get = async function(req, res) {
    const pageId = req.query.page_id;
    const revisionId = req.query.revision_id;

    // check whether accessible
    const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user);
    if (!isAccessible) {
      return res.json(ApiResponse.error('Current user is not accessible to this page.'));
    }

    let fetcher = null;

    try {
      if (revisionId) {
        fetcher = Comment.getCommentsByRevisionId(revisionId);
      }
      else {
        fetcher = Comment.getCommentsByPageId(pageId);
      }
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }

    const comments = await fetcher.populate(
      { path: 'creator', select: User.USER_PUBLIC_FIELDS, populate: User.IMAGE_POPULATION }
    );

    res.json(ApiResponse.success({comments}));
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
    const commentForm = req.form.commentForm;
    const slackNotificationForm = req.form.slackNotificationForm;

    if (!req.form.isValid) {
      // return res.json(ApiResponse.error('Invalid comment.'));
      return res.json(ApiResponse.error('コメントを入力してください。'));
    }

    const pageId = commentForm.page_id;
    const revisionId = commentForm.revision_id;
    const comment = commentForm.comment;
    const position = commentForm.comment_position || -1;
    const isMarkdown = commentForm.is_markdown;

    // check whether accessible
    const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user);
    if (!isAccessible) {
      return res.json(ApiResponse.error('Current user is not accessible to this page.'));
    }

    const createdComment = await Comment.create(pageId, req.user._id, revisionId, comment, position, isMarkdown)
      .catch(function(err) {
        return res.json(ApiResponse.error(err));
      });

    // update page
    const page = await Page.findOneAndUpdate({ _id: pageId }, {
      lastUpdateUser: req.user,
      updatedAt: new Date()
    });

    res.json(ApiResponse.success({comment: createdComment}));

    const path = page.path;

    // global notification
    globalNotificationService.notifyComment(createdComment, path);

    // slack notification
    if (slackNotificationForm.isSlackEnabled) {
      const user = await User.findUserByUsername(req.user.username);
      const channels = slackNotificationForm.slackChannels;

      if (channels) {
        page.updateSlackChannel(channels).catch(err => {
          logger.error('Error occured in updating slack channels: ', err);
        });

        const promises = channels.split(',').map(function(chan) {
          return crowi.slack.postComment(createdComment, user, chan, path);
        });

        Promise.all(promises)
          .catch(err => {
            logger.error('Error occured in sending slack notification: ', err);
          });
      }
    }
  };

  /**
   * @api {post} /comments.remove Remove specified comment
   * @apiName RemoveComment
   * @apiGroup Comment
   *
   * @apiParam {String} comment_id Comment Id.
   */
  api.remove = async function(req, res) {
    const commentId = req.body.comment_id;
    if (!commentId) {
      return Promise.resolve(res.json(ApiResponse.error('\'comment_id\' is undefined')));
    }

    try {
      const comment = await Comment.findById(commentId).exec();

      if (comment == null) {
        throw new Error('This comment does not exist.');
      }

      // check whether accessible
      const pageId = comment.page;
      const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user);
      if (!isAccessible) {
        throw new Error('Current user is not accessible to this page.');
      }

      await comment.remove();
      await Page.updateCommentCount(comment.page);
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }

    return res.json(ApiResponse.success({}));
  };

  return actions;
};
