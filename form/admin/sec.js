'use strict';

var form = require('express-form')
  , field = form.field
  , stringToArray = require('../../lib/formUtil').stringToArrayFilter
  , normalizeCRLF = require('../../lib/formUtil').normalizeCRLFFilter
  ;

module.exports = form(
  field('settingForm[security:basicName]'),
  field('settingForm[security:basicSecret]'),
  field('settingForm[security:registrationMode]').required(),
  field('settingForm[security:registrationWhiteList]').custom(normalizeCRLF).custom(stringToArray)
);

