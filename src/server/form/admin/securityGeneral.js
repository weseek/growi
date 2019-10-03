const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[security:restrictGuestMode]'),
  field('settingForm[security:list-policy:hideRestrictedByOwner]').trim().toBooleanStrict(),
  field('settingForm[security:list-policy:hideRestrictedByGroup]').trim().toBooleanStrict(),
  field('settingForm[security:pageCompleteDeletionAuthority]'),
);
