'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('settingForm[importer:qiita:access_token]').required(),
  field('settingForm[importer:qiita:team_name]').required(),
);

