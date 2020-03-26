
/**
 * Whether path belongs to the trash page
 * @param {string} path
 * @returns {boolean}
 */
const isTrashPage = (path) => {
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

module.exports = {
  isTrashPage,
  isUserPage,
  userPageRoot,
};
