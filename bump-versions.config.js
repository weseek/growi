module.exports = {
  monorepo: {
    mainVersionFile: 'package.json',
    packagesToBump: [
      'packages/app',
      'packages/core',
      'packages/slack',
      'packages/ui',
      'packages/plugin-*',
    ],
  },
};
