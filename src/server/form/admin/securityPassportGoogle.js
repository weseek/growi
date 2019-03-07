const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[security:passport-google:isEnabled]').trim().toBooleanStrict().required(),
  field('settingForm[security:passport-google:clientId]').trim(),
  field('settingForm[security:passport-google:clientSecret]').trim(),
  field('settingForm[security:passport-google:isSameUsernameTreatedAsIdenticalUser]').trim().toBooleanStrict(),
);
