const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[aws:region]', 'リージョン').trim().is(/^[a-z]+-[a-z]+-\d+$/, 'リージョンには、AWSリージョン名を入力してください。 例: ap-northeast-1'),
  field('settingForm[aws:customEndpoint]', 'カスタムエンドポイント').trim().is(/^(https?:\/\/[^/]+|)$/, 'カスタムエンドポイントは、http(s)://で始まるURLを指定してください。また、末尾の/は不要です。'),
  field('settingForm[aws:bucket]', 'バケット名').trim(),
  field('settingForm[aws:accessKeyId]', 'Access Key Id').trim().is(/^[\da-zA-Z]+$/),
  field('settingForm[aws:secretAccessKey]', 'Secret Access Key').trim(),
);
