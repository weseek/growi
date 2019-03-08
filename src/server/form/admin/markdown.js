const form = require('express-form');

const field = form.field;

module.exports = form(
  field('markdownSetting[markdown:isEnabledLinebreaks]').trim().toBooleanStrict(),
  field('markdownSetting[markdown:isEnabledLinebreaksInComments]').trim().toBooleanStrict(),
);
