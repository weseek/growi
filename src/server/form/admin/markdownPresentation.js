'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('markdownSetting[markdown:pageBreakSeparator]').trim().toInt(),
  field('markdownSetting[markdown:xss:option]markdownSetting[markdown:pageBreakCustomSeparator]').trim()
);
