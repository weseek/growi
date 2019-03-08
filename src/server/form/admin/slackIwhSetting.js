const form = require('express-form');

const field = form.field;

module.exports = form(
  field('slackIwhSetting[slack:incomingWebhookUrl]', 'Webhook URL'),
  field('slackIwhSetting[slack:isIncomingWebhookPrioritized]', 'Prioritize Incoming Webhook than Slack App ').trim().toBooleanStrict(),
);
