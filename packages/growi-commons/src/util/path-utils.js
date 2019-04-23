/**
 * Encode specified `path`
 *  with [encodeURIComponent]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent}.
 *
 * @param {string} path
 * @returns {string}
 * @memberof pathUtils
 */
function encodePagePath(path) {
  const paths = path.split('/');
  paths.forEach((item, index) => {
    paths[index] = encodeURIComponent(item);
  });
  return paths.join('/');
}

/**
 * Encode specified `pages` with
 *  [encodeURIComponent]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent}.
 *
 * @param {Page[]} pages
 * @returns {string}
 * @memberof pathUtils
 */
function encodePagesPath(pages) {
  pages.forEach((page) => {
    if (!page.path) {
      return;
    }
    page.path = encodePagePath(page.path);
  });
  return pages;
}

/**
 * @private
 *
 *
 * @param {string} path
 * @returns {RegExpMatchArray}
 * @memberof pathUtils
 */
function matchSlashes(path) {
  // https://regex101.com/r/Z21fEd/5
  return path.match(/^((\/+)?(.+?))(\/+)?$/);
}

/**
 *
 * @param {string} path
 * @returns {boolean}
 * @memberof pathUtils
 */
function hasHeadingSlash(path) {
  const match = matchSlashes(path);
  return (match[2] != null);
}

/**
 *
 * @param {string} path
 * @returns {boolean}
 * @memberof pathUtils
 */
function hasTrailingSlash(path) {
  const match = matchSlashes(path);
  return (match[4] != null);
}

/**
 *
 * @param {string} path
 * @returns {string}
 * @memberof pathUtils
 */
function addHeadingSlash(path) {
  if (path === '/') {
    return path;
  }

  if (!hasHeadingSlash(path)) {
    return `/${path}`;
  }
  return path;
}

/**
 *
 * @param {string} path
 * @returns {string}
 * @memberof pathUtils
 */
function addTrailingSlash(path) {
  if (path === '/') {
    return path;
  }

  if (!hasTrailingSlash(path)) {
    return `${path}/`;
  }
  return path;
}

/**
 *
 * @param {string} path
 * @returns {string}
 * @memberof pathUtils
 */
function removeTrailingSlash(path) {
  if (path === '/') {
    return path;
  }

  const match = matchSlashes(path);
  return match[1];
}

/**
 * A short-hand method to add heading slash and remove trailing slash.
 *
 * @param {string} path
 * @returns {string}
 * @memberof pathUtils
 */
function normalizePath(path) {
  const match = matchSlashes(path);
  if (match == null) {
    return '/';
  }
  return `/${match[3]}`;
}

/**
 * @namespace pathUtils
 */
module.exports = {
  encodePagePath,
  encodePagesPath,
  hasHeadingSlash,
  hasTrailingSlash,
  addHeadingSlash,
  addTrailingSlash,
  removeTrailingSlash,
  normalizePath,
};
