'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('invitedForm.username').required().is(/^[\da-zA-Z\-_\.]+$/),
  field('invitedForm.name').required(),
  field('invitedForm.password').required().is(/^[\x20-\x7F]{6,}$/)
);

