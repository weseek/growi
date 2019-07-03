const form = require('express-form');

const field = form.field;

module.exports = form(
  field('settingForm[customize:isEnabledTimeline]').trim().toBooleanStrict(),
  field('settingForm[customize:isEnabledDeleteCompletely]').trim().toBooleanStrict(),
  field('settingForm[customize:isSavedStatesOfTabChanges]').trim().toBooleanStrict(),
  field('settingForm[customize:isEnabledAttachTitleHeader]').trim().toBooleanStrict(),
  field('settingForm[customize:showRecentCreatedNumber]').trim().toInt(),
);
