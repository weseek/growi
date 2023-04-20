module.exports = {
  env: {
  },
  globals: {
  },
  settings: {
  },
  rules: {
    indent: 'off',
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        SwitchCase: 1,
        ArrayExpression: 'first',
        FunctionDeclaration: { body: 1, parameters: 2 },
        FunctionExpression: { body: 1, parameters: 2 },
        ignoredNodes: [
          'ClassBody > PropertyDefinition[decorators] > Identifier',
          'ClassBody > MethodDefinition[decorators] > Identifier',
        ],
      },
    ],

    // set 'warn' temporarily -- 2022.07.13 Yuki Takei
    '@typescript-eslint/no-explicit-any': ['warn'],
  },
};
