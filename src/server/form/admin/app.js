const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[app:title]').trim(),
  field('settingForm[app:confidential]'),
  field('settingForm[app:globalLang]'),
  field('settingForm[app:fileUpload]').trim().toBooleanStrict(),
);
