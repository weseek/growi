'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('settingForm[sec:registrationMode]').required(),
  field('settingForm[sec:registrationWhiteList]')
);

