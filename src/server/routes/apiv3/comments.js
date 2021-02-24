const express = require('express');

const router = express.Router();

const { body } = require('express-validator');

const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;
const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: Comments
 */

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
module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);

  const User = crowi.model('User');
  const Page = crowi.model('Page');

  const validator = {
    getComment: [
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
    ],
  };

  /**
   * @swagger
   *
   *    /comments/get:
   *      get:
   *        tags: [Comments, CrowiCompatibles]
   *        operationId: getComments
   *        summary: /comments/get
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
  router.get('/', accessTokenParser, loginRequired, validator.getComment, async(req, res) => {
    const pageId = req.query.page_id;
    const revisionId = req.query.revision_id;

    // check whether accessible
    const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user);
    if (!isAccessible) {
      return res.apiv3Err(new ErrorV3('Current user is not accessible to this page.'));
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
      return res.apiv3Err(new ErrorV3(err));
    }

    const comments = await fetcher.populate(
      { path: 'creator', select: User.USER_PUBLIC_FIELDS },
    );

    return res.apiv3({ comments });

  });

  return router;
};
