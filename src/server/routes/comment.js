module.exports = function(crowi, app) {
  const logger = require('@alias/logger')('growi:routes:comment');
  const Comment = crowi.model('Comment');
  const User = crowi.model('User');
  const Page = crowi.model('Page');
  const GlobalNotificationSetting = crowi.model('GlobalNotificationSetting');
  const ApiResponse = require('../util/apiResponse');
  const globalNotificationService = crowi.getGlobalNotificationService();
  const { body } = require('express-validator/check');
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Types.ObjectId;

  const actions = {};
  const api = {};

  actions.api = api;
  api.validators = {};

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
      { path: 'creator', select: User.USER_PUBLIC_FIELDS, populate: User.IMAGE_POPULATION },
    );

    res.json(ApiResponse.success({ comments }));
  };

  api.validators.add = function() {
    const validator = [
      body('commentForm.page_id').exists(),
      body('commentForm.revision_id').exists(),
      body('commentForm.comment').exists(),
      body('commentForm.comment_position').isInt(),
      body('commentForm.is_markdown').isBoolean(),
      body('commentForm.replyTo').exists().custom((value) => {
        if (value === '') {
          return undefined;
        }
        return ObjectId(value);
      }),

      body('slackNotificationForm.isSlackEnabled').isBoolean().exists(),
    ];
    return validator;
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
    const { commentForm, slackNotificationForm } = req.body;
    const { validationResult } = require('express-validator/check');

    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.json(ApiResponse.error('コメントを入力してください。'));
    }

    const pageId = commentForm.page_id;
    const revisionId = commentForm.revision_id;
    const comment = commentForm.comment;
    const position = commentForm.comment_position || -1;
    const isMarkdown = commentForm.is_markdown;
    const replyTo = commentForm.replyTo;

    // check whether accessible
    const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user);
    if (!isAccessible) {
      return res.json(ApiResponse.error('Current user is not accessible to this page.'));
    }

    let createdComment;
    try {
      createdComment = await Comment.create(pageId, req.user._id, revisionId, comment, position, isMarkdown, replyTo);

      await Comment.populate(createdComment, [
        { path: 'creator', model: 'User', select: User.USER_PUBLIC_FIELDS },
      ]);

    }
    catch (err) {
      logger.error(err);
      return res.json(ApiResponse.error(err));
    }

    // update page
    const page = await Page.findOneAndUpdate({ _id: pageId }, {
      lastUpdateUser: req.user,
      updatedAt: new Date(),
    });

    res.json(ApiResponse.success({ comment: createdComment }));

    const path = page.path;

    // global notification
    globalNotificationService.fire(GlobalNotificationSetting.EVENT.COMMENT, path, req.user, {
      comment: createdComment,
    });

    // slack notification
    if (slackNotificationForm.isSlackEnabled) {
      const user = await User.findUserByUsername(req.user.username);
      const channelsStr = slackNotificationForm.slackChannels || null;

      page.updateSlackChannel(channelsStr).catch((err) => {
        logger.error('Error occured in updating slack channels: ', err);
      });

      const channels = channelsStr != null ? channelsStr.split(',') : [null];

      const promises = channels.map((chan) => {
        return crowi.slack.postComment(createdComment, user, chan, path);
      });

      Promise.all(promises)
        .catch((err) => {
          logger.error('Error occured in sending slack notification: ', err);
        });
    }
  };

  /**
   * @api {post} /comments.update Update comment dody
   * @apiName UpdateComment
   * @apiGroup Comment
   */
  api.update = async function(req, res) {
    const { commentForm } = req.body;

    const pageId = commentForm.page_id;
    const revisionId = commentForm.revision_id;
    const comment = commentForm.comment;
    const isMarkdown = commentForm.is_markdown;
    const commentId = commentForm.comment_id;
    const author = commentForm.author;

    if (comment === '') {
      return res.json(ApiResponse.error('Comment text is required'));
    }

    if (commentId == null) {
      return res.json(ApiResponse.error('\'comment_id\' is undefined'));
    }

    if (author !== req.user.username) {
      return res.json(ApiResponse.error('Only the author can edit'));
    }

    // check whether accessible
    const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user._id, revisionId, comment, isMarkdown, req.user);
    if (!isAccessible) {
      return res.json(ApiResponse.error('Current user is not accessible to this page.'));
    }

    let updatedComment;
    try {
      updatedComment = await Comment.updateCommentsByPageId(comment, isMarkdown, commentId);
    }
    catch (err) {
      logger.error(err);
      return res.json(ApiResponse.error(err));
    }

    res.json(ApiResponse.success({ comment: updatedComment }));

    // process notification if needed
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

      await comment.removeWithReplies();
      await Page.updateCommentCount(comment.page);
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }

    return res.json(ApiResponse.success({}));
  };

  return actions;
};
