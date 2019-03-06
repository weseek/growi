const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[google:clientId]').trim().is(/^[\d\.a-z\-\.]+$/),
  field('settingForm[google:clientSecret]').trim().is(/^[\da-zA-Z\-_]+$/),
);
