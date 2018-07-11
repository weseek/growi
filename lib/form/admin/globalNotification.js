'use strict';

const form = require('express-form');
const field = form.field;

module.exports = form(
  field('globalNotification[triggerPath]').trim(),
  field('globalNotification[notifyToType]').trim(),
  field('globalNotification[toEmail]').trim(),
  field('globalNotification[slackChannels]').trim(),
  field('globalNotification[triggerEvent:pageCreate]').trim().toBooleanStrict(),
  field('globalNotification[triggerEvent:pageEdit]').trim().toBooleanStrict(),
  field('globalNotification[triggerEvent:pageDelete]').trim().toBooleanStrict(),
  field('globalNotification[triggerEvent:pageMove]').trim().toBooleanStrict(),
  field('globalNotification[triggerEvent:pageLike]').trim().toBooleanStrict(),
  field('globalNotification[triggerEvent:comment]').trim().toBooleanStrict(),
);

