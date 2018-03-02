'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('settingForm[app:title]').required(),
  field('settingForm[app:confidential]'),
  field('settingForm[app:fileUpload]').trim().toBooleanStrict()
);

