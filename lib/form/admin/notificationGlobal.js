'use strict';

const form = require('express-form');
const field = form.field;

module.exports = form(
  field('notificationGlobal[id]').trim(),
  field('notificationGlobal[triggerPath]').trim(),
  field('notificationGlobal[notifyToType]').trim(),
  field('notificationGlobal[toEmail]').trim(),
  field('notificationGlobal[slackChannels]').trim(),
  field('notificationGlobal[triggerEvent:pageCreate]').trim(),
  field('notificationGlobal[triggerEvent:pageEdit]').trim(),
  field('notificationGlobal[triggerEvent:pageDelete]').trim(),
  field('notificationGlobal[triggerEvent:pageMove]').trim(),
  field('notificationGlobal[triggerEvent:pageLike]').trim(),
  field('notificationGlobal[triggerEvent:comment]').trim(),
);

