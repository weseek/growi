'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('loginForm.username').required(),
  field('loginForm.password').required().is(/^[\x20-\x7F]{6,}$/)
);
