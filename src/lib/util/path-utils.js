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
  const pathRegExp = new RegExp(`^${escapeStringRegexp(oldPath)}`, 'i');
  return `/${childPath.replace(pathRegExp, newPath)}`;
};

module.exports = {
  isTopPage,
  isTrashPage,
  isUserPage,
  userPageRoot,
  convertToNewAffiliationPath,
};
