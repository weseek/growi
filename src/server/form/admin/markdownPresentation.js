'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('markdownSetting[markdown:presentation:pageBreakSeparator]').trim().toInt(),
  field('markdownSetting[markdown:presentation:pageBreakCustomSeparator]').trim()
);
