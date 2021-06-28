const escapeStringRegexp = require('escape-string-regexp');

/**
 * Whether path is the top page
 * @param {string} path
 * @returns {boolean}
 */
const isTopPage = (path) => {
  return path === '/';
};

/**
 * Whether path belongs to the trash page
 * @param {string} path
 * @returns {boolean}
 */
const isTrashPage = (path) => {
  // https://regex101.com/r/BSDdRr/1
  if (path.match(/^\/trash(\/.*)?$/)) {
    return true;
  }

  return false;
};

/**
 * Whether path belongs to the user page
 * @param {string} path
 * @returns {boolean}
 */
const isUserPage = (path) => {
  // https://regex101.com/r/SxPejV/1
  if (path.match(/^\/user(\/.*)?$/)) {
    return true;
  }

  return false;
};

const forbiddenPages = [
  /\^|\$|\*|\+|#|%|\?/,
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

/**
 * Whether path can be created
 * @param {string} path
 * @returns {boolean}
 */
const isCreatablePage = (path) => {
  let isCreatable = true;
  forbiddenPages.forEach((page) => {
    const pageNameReg = new RegExp(page);
    if (path.match(pageNameReg)) {
      isCreatable = false;
    }
  });

  return isCreatable;
};

/**
 * return path to editor
 * @param {string} path
 * @returns {string}
 */
function generateEditorPath(path) {
  return `${path}#edit`;
}

/**
 * return user path
 * @param {Object} user
 * @return {string}
 */
const userPageRoot = (user) => {
  if (!user || !user.username) {
    return '';
  }
  return `/user/${user.username}`;
};

/**
 * return user path
 * @param {string} parentPath
 * @param {string} childPath
 * @param {string} newPath
 *
 * @return {string}
 */
const convertToNewAffiliationPath = (oldPath, newPath, childPath) => {
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
function encodeSpaces(path) {
  if (path == null) {
    return null;
  }

  // Encode SPACE and IDEOGRAPHIC SPACE
  return path.replace(/ /g, '%20').replace(/\u3000/g, '%E3%80%80');
}

module.exports = {
  isTopPage,
  isTrashPage,
  isUserPage,
  isCreatablePage,
  generateEditorPath,
  userPageRoot,
  convertToNewAffiliationPath,
  encodeSpaces,
};
