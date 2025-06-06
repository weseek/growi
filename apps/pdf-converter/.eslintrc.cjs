/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: '../../.eslintrc.js',
  ignorePatterns: [
    'dist/**',
  ],
  rules: {
    'no-useless-constructor': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
  },
};
