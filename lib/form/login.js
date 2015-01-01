'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('loginForm.email').required(),
  field('loginForm.password').required().is(/^[\da-zA-Z@#$%-_&\+\*\?]{6,40}$/)
);
