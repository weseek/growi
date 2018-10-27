'use strict';

const form = require('express-form');
const field = form.field;

module.exports = form(
  field('mePassword.oldPassword'),
  field('mePassword.newPassword').required().is(/^[\x20-\x7F]{6,}$/),
  field('mePassword.newPasswordConfirm').required()
);
