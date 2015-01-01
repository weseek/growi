'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('mePassword.oldPassword'),
  field('mePassword.newPassword').required().is(/^[\da-zA-Z@#$%-_&\+\*\?]{6,40}$/),
  field('mePassword.newPasswordConfirm').required()
);
