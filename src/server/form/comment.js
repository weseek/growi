const form = require('express-form');

const field = form.field;

module.exports = form(
  field('commentForm.page_id').trim().required(),
  field('commentForm.revision_id').trim().required(),
  field('commentForm.comment').trim().required(),
  field('commentForm.comment_position').trim().toInt(),
  field('commentForm.is_markdown').trim().toBooleanStrict(),
  field('commentForm.replyTo').trim().toStringStrict(),

  field('slackNotificationForm.isSlackEnabled').trim().toBooleanStrict().required(),
  field('slackNotificationForm.slackChannels').trim(),
);
