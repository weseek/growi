'use strict';

var form = require('express-form')
  , field = form.field
  ;

module.exports = form(
  field('settingForm[security:passport-github:isEnabled]').trim().toBooleanStrict().required(),
  field('settingForm[security:passport-github:clientId]').trim(),
  field('settingForm[security:passport-github:clientSecret]').trim(),
  field('settingForm[security:passport-github:callbackUrl]').trim(),
  field('settingForm[security:passport-github:isSameUsernameTreatedAsIdenticalUser]').trim().toBooleanStrict(),
);
