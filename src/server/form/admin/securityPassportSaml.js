'use strict';

const form = require('express-form');
const field = form.field;

module.exports = form(
  field('settingForm[security:passport-saml:isEnabled]').trim().toBooleanStrict().required(),
  field('settingForm[security:passport-saml:entryPoint]').trim().required().isUrl(),
  field('settingForm[security:passport-saml:issuer]').trim().required(),
  field('settingForm[security:passport-saml:attrMapId]').trim().required(),
  field('settingForm[security:passport-saml:attrMapUsername]').trim().required(),
  field('settingForm[security:passport-saml:attrMapMail]').trim().required(),
  field('settingForm[security:passport-saml:attrMapFirstName]').trim(),
  field('settingForm[security:passport-saml:attrMapLastName]').trim(),
  field('settingForm[security:passport-saml:cert]').trim(),
  field('settingForm[security:passport-saml:isSameUsernameTreatedAsIdenticalUser]').trim().toBooleanStrict(),
  field('settingForm[security:passport-saml:isSameEmailTreatedAsIdenticalUser]').trim().toBooleanStrict(),
);
