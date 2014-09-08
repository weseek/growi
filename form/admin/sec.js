'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('settingForm[security:basicName]'),
  field('settingForm[security:basicSecret]'),
  field('settingForm[security:registrationMode]').required(),
  field('settingForm[security:registrationWhiteList]')
);

