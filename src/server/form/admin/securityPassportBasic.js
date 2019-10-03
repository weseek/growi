const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[security:passport-basic:isEnabled]').trim().toBooleanStrict().required(),
  field('settingForm[security:passport-basic:isSameUsernameTreatedAsIdenticalUser]').trim().toBooleanStrict(),
);
