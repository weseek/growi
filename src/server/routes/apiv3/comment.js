import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:comment'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const ErrorV3 = require('../../models/vo/error-apiv3');


module.exports = (crowi) => {

  router.get('/', async(req, res) => {
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

    // res.json(ApiResponse.success({ comments }));
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
