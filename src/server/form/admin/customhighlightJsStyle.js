const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[customize:highlightJsStyle]'),
  field('settingForm[customize:highlightJsStyleBorder]').trim().toBooleanStrict(),
);
