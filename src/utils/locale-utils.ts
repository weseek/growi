import fs, { Dirent } from 'fs';

import { resolveFromRoot } from './project-dir-utils';

const localesDir = resolveFromRoot('resource/locales');

/**
 * List locales dirents
 */
function listLocaleDirents(): Dirent[] {
  const allDirents = fs.readdirSync(localesDir, { withFileTypes: true });
  return allDirents
    .filter(dirent => dirent.isDirectory());
}

/**
 * List locales aliases
 */
export function listLocaleMetadatas(): Record<string, unknown>[] {
  return listLocaleDirents()
    .map(dir => dir.name)
    .map(localeDirName => require(`^/resource/locales/${localeDirName}/meta.json`));
}

/**
 * List locales IDs (=subdir names)
 */
export function listLocaleIds(): string[] {
  return listLocaleMetadatas()
    .map(meta => meta.id as string);
}
