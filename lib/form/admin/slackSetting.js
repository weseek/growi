'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('slackSetting[slack:clientId]', 'clientId').is(/(\d+)\.(\d+)/).required(),
  field('slackSetting[slack:clientSecret]', 'clientSecret').required().is(/([0-9a-f]+)/)
);

