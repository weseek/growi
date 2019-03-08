const form = require('express-form');

const field = form.field;

module.exports = form(
  field('imagetypeForm.isGravatarEnabled').required(),
);
