module.exports = {
  extends: [
    'weseek',
    'weseek/react',
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
    window: true,
  },
  plugins: [
    "jest",
  ],
  rules: {
    'indent': [
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
    // eslint-plugin-import rules
    'import/no-unresolved': [2, { ignore: ['^@'] }], // ignore @alias/..., @commons/..., ...
  },
};
