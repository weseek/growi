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
function listLocaleAliases() {
  return listLocaleIds()
    .map(localeId => require(`@root/resource/locales/${localeId}/_conf.json`))
    .filter(meta => meta.aliases != null)
    .map(meta => meta.aliases)
    .flat();
}

module.exports = {
  listLocaleIds,
  listLocaleAliases,
};
