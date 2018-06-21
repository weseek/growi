'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('markdownSetting[markdown:XSS:isPrevented]').trim().toBooleanStrict(),
  field('markdownSetting[markdown:XSS:option]').trim().toBooleanStrict(),
  field('markdownSetting[markdown:XSS:tagWhiteList]').trim().toBooleanStrict(),
  field('markdownSetting[markdown:XSS:attrWhiteList]').trim().toBooleanStrict()
);

