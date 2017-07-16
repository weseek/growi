'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('slackSetting[slack:clientId]', 'clientId'),
  field('slackSetting[slack:clientSecret]', 'clientSecret')
);

