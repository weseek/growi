const form = require('express-form');

const field = form.field;

module.exports = form(
  field('loginForm.username').required(),
  field('loginForm.password').required(),
);
