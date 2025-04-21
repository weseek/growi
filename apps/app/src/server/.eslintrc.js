module.exports = {
  extends: '../../.eslintrc.js',
  rules: {
    // restrict importing from client/ and components/ directories
    'no-restricted-imports': [
      'error',
      {
        patterns: ['~/client/', 'client/'],
      },
    ],
  },
};
