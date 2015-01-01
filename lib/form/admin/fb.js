'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('settingForm[facebook:appId]').trim().is(/^\d+$/),
  field('settingForm[facebook:secret]').trim().is(/^[\da-z]+$/)
);

