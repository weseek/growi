'use strict';

var form = require('express-form')
  , field = form.field
  , stringToArray = require('../../util/formUtil').stringToArrayFilter
  , normalizeCRLF = require('../../util/formUtil').normalizeCRLFFilter
  ;

module.exports = form(
  field('settingForm[security:basicName]'),
  field('settingForm[security:basicSecret]'),
  field('settingForm[security:restrictGuestMode]').required(),
  field('settingForm[security:registrationMode]').required(),
  field('settingForm[security:registrationWhiteList]').custom(normalizeCRLF).custom(stringToArray)
);
