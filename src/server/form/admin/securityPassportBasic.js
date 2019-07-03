const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[security:passport-basic:isEnabled]').trim().toBooleanStrict().required(),
  field('settingForm[security:passport-basic:id]').trim(),
  field('settingForm[security:passport-basic:password]').trim(),
);
