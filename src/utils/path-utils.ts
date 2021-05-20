import escapeStringRegexp from 'escape-string-regexp';

/**
 * Whether path is the top page
 * @param path
 */
export const isTopPage = (path: string): boolean => {
  return path === '/';
};

/**
 * Whether path belongs to the trash page
 * @param path
 */
export const isTrashPage = (path: string): boolean => {
  // https://regex101.com/r/BSDdRr/1
  if (path.match(/^\/trash(\/.*)?$/)) {
    return true;
  }

  return false;
};

/**
 * Whether path belongs to the user page
 * @param path
 */
export const isUserPage = (path: string): boolean => {
  // https://regex101.com/r/SxPejV/1
  if (path.match(/^\/user(\/.*)?$/)) {
    return true;
  }

  return false;
};

/**
 * Whether path belongs to the shared page
 * @param path
 */
export const isSharedPage = (path: string): boolean => {
  // https://regex101.com/r/ZjdOiB/1
  if (path.match(/^\/share(\/.*)?$/)) {
    return true;
  }

  return false;
};

const restrictedPatternsToDelete: Array<RegExp> = [
  /^\/user\/[^/]+$/, // user page
];
export const isDeletablePage = (path: string): boolean => {
  return !restrictedPatternsToDelete.some(pattern => path.match(pattern));
};

const restrictedPatternsToCreate: Array<RegExp> = [
  /\^|\$|\*|\+|#|%/,
  /^\/-\/.*/,
  /^\/_r\/.*/,
  /^\/_apix?(\/.*)?/,
  /^\/?https?:\/\/.+$/, // avoid miss in renaming
  /\/{2,}/, // avoid miss in renaming
  /\s+\/\s+/, // avoid miss in renaming
  /.+\/edit$/,
  /.+\.md$/,
  /^(\.\.)$/, // see: https://github.com/weseek/growi/issues/3582
  /(\/\.\.)\/?/, // see: https://github.com/weseek/growi/issues/3582
  /^\/(installer|register|login|logout|admin|me|files|trash|paste|comments|tags|share)(\/.*|$)/,
];
export const isCreatablePage = (path: string): boolean => {
  return !restrictedPatternsToCreate.some(pattern => path.match(pattern));
};

/**
 * return user path
 * @param user
 */
export const userPageRoot = (user: any): string => {
  if (!user || !user.username) {
    return '';
  }
  return `/user/${user.username}`;
};

/**
 * return user path
 * @param parentPath
 * @param childPath
 * @param newPath
 */
export const convertToNewAffiliationPath = (oldPath: string, newPath: string, childPath: string): string => {
  if (newPath === null) {
    throw new Error('Please input the new page path');
  }
  const pathRegExp = new RegExp(`^${escapeStringRegexp(oldPath)}`, 'i');
  return childPath.replace(pathRegExp, newPath);
};

/**
 * Encode SPACE and IDEOGRAPHIC SPACE
 * @param {string} path
 * @returns {string}
 */
export const encodeSpaces = (path?:string): string | undefined => {
  if (path == null) {
    return undefined;
  }

  // Encode SPACE and IDEOGRAPHIC SPACE
  return path.replace(/ /g, '%20').replace(/\u3000/g, '%E3%80%80');
};
