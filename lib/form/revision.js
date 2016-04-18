'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('pageForm.path').required(),
  field('pageForm.body').required().custom(function(value) { return value.replace(/\r/g, '\n'); }),
  field('pageForm.currentRevision'),
  field('pageForm.grant').toInt().required(),
  field('pageForm.notify')
);
