const form = require('express-form');

const field = form.field;

module.exports = form(
  field('apiTokenForm.confirm').required(),
);
