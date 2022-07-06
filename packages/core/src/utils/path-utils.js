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
export function hasHeadingSlash(path) {
  if (path === '') {
    return false;
  }
  const match = matchSlashes(path);
  return (match[2] != null);
}

/**
 *
 * @param {string} path
 * @returns {boolean}
 * @memberof pathUtils
 */
export function hasTrailingSlash(path) {
  if (path === '') {
    return false;
  }
  const match = matchSlashes(path);
  return (match[4] != null);
}

/**
 *
 * @param {string} path
 * @returns {string}
 * @memberof pathUtils
 */
export function addHeadingSlash(path) {
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
export function addTrailingSlash(path) {
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
export function removeHeadingSlash(path) {
  if (path === '/') {
    return path;
  }

  return hasHeadingSlash(path)
    ? path.substring(1)
    : path;
}

/**
 *
 * @param {string} path
 * @returns {string}
 * @memberof pathUtils
 */
export function removeTrailingSlash(path) {
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
export function normalizePath(path) {
  if (path === '' || path === '/') {
    return '/';
  }

  const match = matchSlashes(path);
  if (match == null) {
    return '/';
  }
  return `/${match[3]}`;
}


/**
 *
 * @param {string} path
 * @returns {string}
 * @memberof pathUtils
 */
export function attachTitleHeader(path) {
  return `# ${path}`;
}
