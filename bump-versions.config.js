/*
 * Reference: https://community.algolia.com/shipjs/
 */
module.exports = {
  monorepo: {
    mainVersionFile: 'package.json',
    packagesToBump: [
      'apps/*',
      'packages/*',
    ],
  },
};
