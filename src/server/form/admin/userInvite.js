'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('inviteForm[emailList]', '招待メールアドレス').trim().required(),
  field('inviteForm[sendEmail]').trim()
);
