const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[app:siteUrl]').trim().isUrl(),
);
