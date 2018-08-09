'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('pageForm.path').required(),
  field('pageForm.body').required().custom(function(value) {
    // see https://github.com/weseek/growi/issues/463
    return value.replace(/\r\n?/g, '\n');
  }),
  field('pageForm.currentRevision'),
  field('pageForm.grant').toInt().required(),
  field('pageForm.grantUserGroupId'),
  field('pageForm.notify')
);
