'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('settingForm[fb:appId]').trim().is(/^\d+$/),
  field('settingForm[fb:seret]').trim().is(/^[\da-z]+$/)
);

