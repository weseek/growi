/*
 * Reference: https://community.algolia.com/shipjs/
 */
module.exports = {
  monorepo: {
    mainVersionFile: 'lerna.json',
    packagesToBump: [
      './',
      'packages/*',
    ],
  },
};
