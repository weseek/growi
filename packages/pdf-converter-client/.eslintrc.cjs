/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: '../../.eslintrc.js',
  ignorePatterns: [
    'src/index.ts',
    'dist/index.d.ts',
    'dist/index.js',
  ],
};
