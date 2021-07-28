module.exports = {
  root: true, // https://eslint.org/docs/user-guide/configuring/configuration-files#cascading-and-hierarchy
  extends: [
    'weseek',
    'weseek/react',
    'weseek/typescript',
    "plugin:jest/recommended",
  ],
  env: {
    jquery: true,
    "jest/globals": true,
  },
  globals: {
    $: true,
    jquery: true,
    emojione: true,
    hljs: true,
    ScrollPosStyler: true,
    window: true,
  },
  plugins: [
    "jest",
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'no-restricted-imports': ['error', {
      name: 'axios',
      message: 'Please use src/utils/axios instead.',
    }],
    '@typescript-eslint/no-explicit-any': 'off',
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
        ignoredNodes: ['JSXElement *', 'JSXElement', 'JSXAttribute', 'JSXSpreadAttribute'],
        ArrayExpression: 'first',
        FunctionDeclaration: { body: 1, parameters: 2 },
        FunctionExpression: { body: 1, parameters: 2 },
      },
    ],
  },
};
