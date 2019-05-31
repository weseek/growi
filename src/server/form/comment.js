const { body } = require('express-validator/check');
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;
module.exports = [
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
