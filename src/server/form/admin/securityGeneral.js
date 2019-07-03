const form = require('express-form');

const field = form.field;
const stringToArray = require('../../util/formUtil').stringToArrayFilter;
const normalizeCRLF = require('../../util/formUtil').normalizeCRLFFilter;

module.exports = form(
  field('settingForm[security:restrictGuestMode]').required(),
  field('settingForm[security:registrationMode]').required(),
  field('settingForm[security:registrationWhiteList]').custom(normalizeCRLF).custom(stringToArray),
  field('settingForm[security:list-policy:hideRestrictedByOwner]').trim().toBooleanStrict(),
  field('settingForm[security:list-policy:hideRestrictedByGroup]').trim().toBooleanStrict(),
  field('settingForm[security:pageCompleteDeletionAuthority]'),
);
