const form = require('express-form');

const field = form.field;

module.exports = form(
  field('registrationForm.token').required(),
  field('registrationForm.username').required().is(/^[\da-zA-Z\-_.]+$/),
  field('registrationForm.name').required(),
  field('registrationForm.password').required().is(/^[\x20-\x7F]*$/).minLength(6),
);
