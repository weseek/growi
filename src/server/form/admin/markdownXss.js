const form = require('express-form');

const field = form.field;

module.exports = form(
  field('markdownSetting[markdown:xss:isEnabledPrevention]').trim().toBooleanStrict(),
  field('markdownSetting[markdown:xss:option]').trim().toInt(),
  field('markdownSetting[markdown:xss:tagWhiteList]').trim(),
  field('markdownSetting[markdown:xss:attrWhiteList]').trim(),
);
