module.exports = {
  extends: [
    'plugin:jest/recommended',
  ],
  env: {
    'jest/globals': true,
  },
  plugins: ['jest'],
  rules: {
    'jest/no-done-callback': ['warn'],
    'jest/no-standalone-expect': [
      'error',
      { additionalTestBlockFunctions: ['each.test'] },
    ],
  }
};
