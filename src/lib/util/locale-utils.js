const fs = require('fs');

const helpers = require('./helpers');

const MIGRATE_LOCALE_MAP = {
  en: 'en_US',
  ja: 'ja_JP',
};

/**
 * List locales dirents
 */
function listLocaleDirents() {
  const allDirents = fs.readdirSync(helpers.root('resource/locales'), { withFileTypes: true });
  return allDirents
    .filter(dirent => dirent.isDirectory());
}

/**
 * List locales aliases
 */
function listLocaleMetadatas() {
  return listLocaleDirents()
    .map(dir => dir.name)
    .map(localeDirName => require(`../../../resource/locales/${localeDirName}/meta.json`));
}

/**
 * List locales IDs (=subdir names)
 */
function listLocaleIds() {
  return listLocaleMetadatas()
    .map(meta => meta.id);
}

function migrateDeprecatedLocaleId(localeId) {
  const toValue = MIGRATE_LOCALE_MAP[localeId];

  if (toValue != null) {
    return toValue;
  }

  return localeId;
}

module.exports = {
  listLocaleMetadatas,
  listLocaleIds,
  migrateDeprecatedLocaleId,
};
