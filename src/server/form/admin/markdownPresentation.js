'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('markdownSetting[markdown:pageBreakSeparator]').trim().toInt(),
  field('markdownSetting[markdown:pageBreakCustomSeparator]').trim()
);
