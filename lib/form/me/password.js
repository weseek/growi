'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('mePassword.oldPassword'),
  field('mePassword.newPassword').required().is(/^[\x20-\x7F]{6,40}$/),
  field('mePassword.newPasswordConfirm').required()
);
  //[}m943&T^x7.2kB%98;9CD2Kx[kr{/v!4
