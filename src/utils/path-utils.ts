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
 * return user path
 * @param user
 */
export const userPageRoot = (user: any): string => {
  if (!user || !user.username) {
    return '';
  }
  return `/user/${user.username}`;
};
