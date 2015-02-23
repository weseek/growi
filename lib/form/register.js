'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('registerForm.username').required().is(/^[\da-zA-Z\-_]+$/),
  field('registerForm.name').required(),
  field('registerForm.email').required(),
  field('registerForm.password').required().is(/^[\da-zA-Z@#$%-_&\+\*\?]{6,64}$/),
  field('registerForm.fbId').isInt(),
  field('registerForm.googleId').isInt()
);
