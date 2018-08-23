'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('settingForm[aws:region]', 'リージョン').trim().is(/^[a-z]+-[a-z]+-\d+$/, 'リージョンには、AWSリージョン名を入力してください。 例: ap-northeast-1'),
  field('settingForm[aws:bucket]', 'バケット名').trim(),
  field('settingForm[aws:accessKeyId]', 'Access Key Id').trim().is(/^[\da-zA-Z]+$/),
  field('settingForm[aws:secretAccessKey]', 'Secret Access Key').trim()
);

