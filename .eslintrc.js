module.exports = {
  extends: [
    'weseek',
    'weseek/react',
  ],
  env: {
    mocha: true,
    jquery: true,
  },
  globals: {
    $: true,
    jquery: true,
    emojione: true,
    hljs: true,
    window: true,
  },
  plugins: [
    'chai-friendly',
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
    'react/jsx-filename-extension': [
      'warn',
      { extensions: ['.jsx']},
    ],
    // eslint-plugin-import rules
    'import/no-unresolved': [2, { ignore: ['^@'] }], // ignore @alias/..., @commons/..., ...
    // eslint-plugin-chai-friendly rules
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,
  },
};
