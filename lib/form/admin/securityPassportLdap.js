'use strict';

var form = require('express-form')
  , field = form.field
  ;

module.exports = form(
  field('settingForm[security:passport-ldap:isEnabled]').trim().toBooleanStrict().required(),
  field('settingForm[security:passport-ldap:serverUrl]'),
  field('settingForm[security:passport-ldap:isUserBind]').trim().toBooleanStrict(),
  field('settingForm[security:passport-ldap:bindDN]'),
  field('settingForm[security:passport-ldap:bindDNPassword]'),
  field('settingForm[security:passport-ldap:searchFilter]')
);

