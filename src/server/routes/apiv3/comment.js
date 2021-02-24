import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:comment'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const { body } = require('express-validator');

const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;
const ErrorV3 = require('../../models/vo/error-apiv3');

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
  const User = crowi.model('User');
  const Page = crowi.model('Page');


  router.get('/', validator.getComment, async(req, res) => {
    // api.get = async function(req, res) {
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

    res.apiv3({ comments });
    // };

    // api.validators.add = function() {
    //   const validator = [
    //     body('commentForm.page_id').exists(),
    //     body('commentForm.revision_id').exists(),
    //     body('commentForm.comment').exists(),
    //     body('commentForm.comment_position').isInt(),
    //     body('commentForm.is_markdown').isBoolean(),
    //     body('commentForm.replyTo').exists().custom((value) => {
    //       if (value === '') {
    //         return undefined;
    //       }
    //       return ObjectId(value);
    //     }),

    //     body('slackNotificationForm.isSlackEnabled').isBoolean().exists(),
    //   ];
    //   return validator;
    // };

  });

  return router;
};
