module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'weseek',
    'weseek/typescript',
    'plugin:jest/recommended',
  ],
  env: {
    'jest/globals': true,
  },
  globals: {
  },
  plugins: [
    'jest',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
        ArrayExpression: 'first',
        FunctionDeclaration: { body: 1, parameters: 2 },
        FunctionExpression: { body: 1, parameters: 2 },
      },
    ],
  },
};
