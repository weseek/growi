const form = require('express-form');

const field = form.field;

module.exports = form(
  field('inviteForm[emailList]', '招待メールアドレス').trim().required(),
  field('inviteForm[sendEmail]').trim(),
);
