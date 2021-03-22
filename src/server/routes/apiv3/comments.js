import Comment from '~/server/models/comment';

const express = require('express');

const router = express.Router();

const { query } = require('express-validator');
const { serializeUserSecurely } = require('../../models/serializers/user-serializer');
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
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const Page = crowi.model('Page');

  const validator = {
    getComments: [
      query('pageId').isMongoId().withMessage('pageId is required'),
      query('revisionId').if(value => value != null).isMongoId().withMessage('revisionId must be MongoId'),
    ],
  };


  /**
   * @swagger
   *
   *    /comments:
   *      get:
   *        tags: [Comments, CrowiCompatibles]
   *        operationId: getComments
   *        summary: /comments/get
   *        description: Get comments of the page of the revision
   *        parameters:
   *          - in: query
   *            name: pageId
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *            required: true
   *          - in: query
   *            name: revisionId
   *            schema:
   *              $ref: '#/components/schemas/Revision/properties/_id'
   *            required: true
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
  router.get('/', accessTokenParser, loginRequired, validator.getComments, apiV3FormValidator, async(req, res) => {
    const { pageId, revisionId } = req.query;

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
      return res.apiv3Err(new ErrorV3(err), 500);
    }

    const result = await fetcher.populate(
      { path: 'creator' },
    );

    const comments = result.map((comment) => {
      // return email only when specified by query
      comment.creator = serializeUserSecurely(comment.creator);
      return comment;
    });

    return res.apiv3({ comments });

  });

  return router;
};
