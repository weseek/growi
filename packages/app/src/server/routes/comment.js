import loggerFactory from '~/utils/logger';

/**
 * @swagger
 *  tags:
 *    name: Comments
 */

const { serializeUserSecurely } = require('../models/serializers/user-serializer');

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      Comment:
 *        description: Comment
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: revision ID
 *            example: 5e079a0a0afa6700170a75fb
 *          __v:
 *            type: number
 *            description: DB record version
 *            example: 0
 *          page:
 *            $ref: '#/components/schemas/Page/properties/_id'
 *          creator:
 *            $ref: '#/components/schemas/User/properties/_id'
 *          revision:
 *            $ref: '#/components/schemas/Revision/properties/_id'
 *          comment:
 *            type: string
 *            description: comment
 *            example: good
 *          commentPosition:
 *            type: number
 *            description: comment position
 *            example: 0
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 */

module.exports = function(crowi, app) {
  const logger = loggerFactory('growi:routes:comment');
  const Comment = crowi.model('Comment');
  const User = crowi.model('User');
  const Page = crowi.model('Page');
  const GlobalNotificationSetting = crowi.model('GlobalNotificationSetting');
  const ApiResponse = require('../util/apiResponse');

  const globalNotificationService = crowi.getGlobalNotificationService();
  const userNotificationService = crowi.getUserNotificationService();

  const { body } = require('express-validator');
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Types.ObjectId;

  const actions = {};
  const api = {};

  actions.api = api;
  api.validators = {};

  /**
   * @swagger
   *
   *    /comments.get:
   *      get:
   *        tags: [Comments, CrowiCompatibles]
   *        operationId: getComments
   *        summary: /comments.get
   *        description: Get comments of the page of the revision
   *        parameters:
   *          - in: query
   *            name: page_id
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *          - in: query
   *            name: revision_id
   *            schema:
   *              $ref: '#/components/schemas/Revision/properties/_id'
   *        responses:
   *          200:
   *            description: Succeeded to get comments of the page of the revision.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    comments:
   *                      type: array
   *                      items:
   *                        $ref: '#/components/schemas/Comment'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
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

    const comments = await fetcher.populate('creator');
    comments.forEach((comment) => {
      if (comment.creator != null && comment.creator instanceof User) {
        comment.creator = serializeUserSecurely(comment.creator);
      }
    });

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
   * @swagger
   *
   *    /comments.add:
   *      post:
   *        tags: [Comments, CrowiCompatibles]
   *        operationId: addComment
   *        summary: /comments.add
   *        description: Post comment for the page
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  commentForm:
   *                    type: object
   *                    properties:
   *                      page_id:
   *                        $ref: '#/components/schemas/Page/properties/_id'
   *                      revision_id:
   *                        $ref: '#/components/schemas/Revision/properties/_id'
   *                      comment:
   *                        $ref: '#/components/schemas/Comment/properties/comment'
   *                      comment_position:
   *                        $ref: '#/components/schemas/Comment/properties/commentPosition'
   *                required:
   *                  - commentForm
   *        responses:
   *          200:
   *            description: Succeeded to post comment for the page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    comment:
   *                      $ref: '#/components/schemas/Comment'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
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
    const { validationResult } = require('express-validator');

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
    }
    catch (err) {
      logger.error(err);
      return res.json(ApiResponse.error(err));
    }

    // update page
    const page = await Page.findOneAndUpdate(
      { _id: pageId },
      {
        lastUpdateUser: req.user,
        updatedAt: new Date(),
      },
    );

    res.json(ApiResponse.success({ comment: createdComment }));

    // global notification
    try {
      await globalNotificationService.fire(GlobalNotificationSetting.EVENT.COMMENT, page, req.user, {
        comment: createdComment,
      });
    }
    catch (err) {
      logger.error('Comment notification　failed', err);
    }

    // slack notification
    if (slackNotificationForm.isSlackEnabled) {
      const { slackChannels } = slackNotificationForm;

      try {
        const results = await userNotificationService.fire(page, req.user, slackChannels, 'comment', {}, createdComment);
        results.forEach((result) => {
          if (result.status === 'rejected') {
            logger.error('Create user notification failed', result.reason);
          }
        });
      }
      catch (err) {
        logger.error('Create user notification failed', err);
      }
    }
  };

  /**
   * @swagger
   *
   *    /comments.update:
   *      post:
   *        tags: [Comments, CrowiCompatibles]
   *        operationId: updateComment
   *        summary: /comments.update
   *        description: Update comment dody
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  form:
   *                    type: object
   *                    properties:
   *                      commentForm:
   *                        type: object
   *                        properties:
   *                          page_id:
   *                            $ref: '#/components/schemas/Page/properties/_id'
   *                          revision_id:
   *                            $ref: '#/components/schemas/Revision/properties/_id'
   *                          comment:
   *                            $ref: '#/components/schemas/Comment/properties/comment'
   *                          comment_position:
   *                            $ref: '#/components/schemas/Comment/properties/commentPosition'
   *                required:
   *                  - form
   *        responses:
   *          200:
   *            description: Succeeded to update comment dody.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    comment:
   *                      $ref: '#/components/schemas/Comment'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /comments.update Update comment dody
   * @apiName UpdateComment
   * @apiGroup Comment
   */
  api.update = async function(req, res) {
    const { commentForm } = req.body;

    const pageId = commentForm.page_id;
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
    const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user);
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
   * @swagger
   *
   *    /comments.remove:
   *      post:
   *        tags: [Comments, CrowiCompatibles]
   *        operationId: removeComment
   *        summary: /comments.remove
   *        description: Remove specified comment
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  comment_id:
   *                    $ref: '#/components/schemas/Comment/properties/_id'
   *                required:
   *                  - comment_id
   *        responses:
   *          200:
   *            description: Succeeded to remove specified comment.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    comment:
   *                      $ref: '#/components/schemas/Comment'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
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
