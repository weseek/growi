'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('slackIwhSetting[slack:incomingWebhookUrl]', 'Webhook URL'),
  field('slackIwhSetting[slack:isIncomingWebhookPrioritized]', 'Prioritize Incoming Webhook than Slack App ').trim().toBooleanStrict()
);

