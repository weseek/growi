'use strict';

var form = require('express-form')
  , field = form.field
  ;

module.exports = form(
  field('settingForm[security:passport-ldap:isEnabled]').trim().toBooleanStrict().required(),
  field('settingForm[security:passport-ldap:serverUrl]').trim()
      // https://regex101.com/r/E0UL6D/1
      .is(/^ldaps?:\/\/([^\/\s]+)\/([^\/\s]+)$/, 'Server URL is invalid. <small><a href="https://regex101.com/r/E0UL6D/1">&gt;&gt; Regex</a></small>'),
  field('settingForm[security:passport-ldap:isUserBind]').trim().toBooleanStrict(),
  field('settingForm[security:passport-ldap:bindDN]').trim()
      // https://regex101.com/r/jK8lpO/1
      .is(/^(,?[^,=\s]+=[^,=\s]+){1,}$|^[^@\s]+@[^@\s]+$/, 'Bind DN is invalid. <small><a href="https://regex101.com/r/jK8lpO/3">&gt;&gt; Regex</a></small>'),
  field('settingForm[security:passport-ldap:bindDNPassword]'),
  field('settingForm[security:passport-ldap:searchFilter]'),
  field('settingForm[security:passport-ldap:attrMapUsername]'),
  field('settingForm[security:passport-ldap:attrMapName]'),
  field('settingForm[security:passport-ldap:attrMapMail]'),
  field('settingForm[security:passport-ldap:isSameUsernameTreatedAsIdenticalUser]').trim().toBooleanStrict(),
  field('settingForm[security:passport-ldap:groupSearchBase]'),
  field('settingForm[security:passport-ldap:groupSearchFilter]'),
  field('settingForm[security:passport-ldap:groupDnProperty]')
);
