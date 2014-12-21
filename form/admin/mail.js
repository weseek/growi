'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('settingForm[mail:from]', 'メールFrom').trim(),
  field('settingForm[mail:smtpHost]', 'SMTPホスト').trim(),
  field('settingForm[mail:smtpPort]', 'SMTPポート').trim().toInt(),
  field('settingForm[mail:smtpUser]', 'SMTPユーザー').trim(),
  field('settingForm[mail:smtpPassword]', 'SMTPパスワード').trim()
);


