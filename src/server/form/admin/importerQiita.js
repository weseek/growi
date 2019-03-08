const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[importer:qiita:access_token]').required(),
  field('settingForm[importer:qiita:team_name]').required(),
);
