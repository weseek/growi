import path from 'path';
import fs from 'fs';

const localesDir = path.resolve(__dirname, '../../resource/locales');

/**
 * List locales dirents
 */
function listLocaleDirents() {
  const allDirents = fs.readdirSync(localesDir, { withFileTypes: true });
  return allDirents
    .filter(dirent => dirent.isDirectory());
}

/**
 * List locales aliases
 */
function listLocaleMetadatas() {
  return listLocaleDirents()
    .map(dir => dir.name)
    .map(localeDirName => require(`^/resource/locales/${localeDirName}/meta.json`));
}

/**
 * List locales IDs (=subdir names)
 */
function listLocaleIds() {
  return listLocaleMetadatas()
    .map(meta => meta.id);
}

module.exports = {
  listLocaleMetadatas,
  listLocaleIds,
};
