const fs = require('fs');

const helpers = require('./helpers');

/**
 * List locales dirents
 */
function listLocaleDirents() {
  const allDirents = fs.readdirSync(helpers.root('resource/locales'), { withFileTypes: true });
  return allDirents
    .filter(dirent => dirent.isDirectory());
}

/**
 * List locales IDs (=subdir names)
 */
function listLocaleIds() {
  return listLocaleDirents()
    .map(dir => dir.name);
}

/**
 * List locales aliases
 */
function listLocaleMetadatas() {
  return listLocaleIds()
    .map(localeId => require(`../../../resource/locales/${localeId}/_conf.json`));
}

/**
 * List locales aliases
 */
function listLocaleAliases() {
  return listLocaleMetadatas()
    .map(meta => meta.aliases)
    .flat();
}

/**
 * List locales aliases
 */
function getLocaleAliasToIdMap() {
  const aliasToIdMap = {};

  const metadatas = listLocaleMetadatas();

  metadatas.forEach((meta) => {
    meta.aliases.forEach((alias) => {
      aliasToIdMap[alias] = meta.id;
    });
  });

  return aliasToIdMap;
}

module.exports = {
  listLocaleIds,
  listLocaleMetadatas,
  listLocaleAliases,
  getLocaleAliasToIdMap,
};
