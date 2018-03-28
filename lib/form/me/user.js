'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('userForm.name').trim().required(),
  field('userForm.email').trim().isEmail().required(),
  field('userForm.lang').required(),
  field('userForm.isEmailPublished').trim().toBooleanStrict().required()
);
