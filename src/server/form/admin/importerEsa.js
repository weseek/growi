'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('settingForm[importer:esa:access_token]').required(),
  field('settingForm[importer:esa:team_name]').required(),
);

