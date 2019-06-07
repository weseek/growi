const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[security:passport-oidc:isEnabled]').trim().toBooleanStrict().required(),
  field('settingForm[security:passport-oidc:issuerHost]').trim(),
  field('settingForm[security:passport-oidc:clientId]').trim(),
  field('settingForm[security:passport-oidc:clientSecret]').trim(),
  field('settingForm[security:passport-oidc:attrMapId]').trim(),
  field('settingForm[security:passport-oidc:attrMapUserName]').trim(),
  field('settingForm[security:passport-oidc:attrMapName]').trim(),
  field('settingForm[security:passport-oidc:attrMapMail]').trim(),
  field('settingForm[security:passport-oidc:isSameEmailTreatedAsIdenticalUser]').trim().toBooleanStrict(),
  field('settingForm[security:passport-oidc:isSameUsernameTreatedAsIdenticalUser]').trim().toBooleanStrict(),
);
