'use strict';

const form = require('express-form');
const field = form.field;

module.exports = form(
  field('settingForm[security:passport-saml:isEnabled]').trim().toBooleanStrict().required(),
  field('settingForm[security:passport-saml:entryPoint]').trim(),
  field('settingForm[security:passport-saml:callbackUrl]').trim(),
  field('settingForm[security:passport-saml:issuer]').trim(),
  field('settingForm[security:passport-saml:attrMapId]'),
  field('settingForm[security:passport-saml:attrMapUsername]'),
  field('settingForm[security:passport-saml:attrMapMail]'),
  field('settingForm[security:passport-saml:attrMapFirstName]'),
  field('settingForm[security:passport-saml:attrMapLastName]'),
  field('settingForm[security:passport-saml:isSameUsernameTreatedAsIdenticalUser]').trim().toBooleanStrict(),
);
