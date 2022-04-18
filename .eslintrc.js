module.exports = {
  root: true, // https://eslint.org/docs/user-guide/configuring/configuration-files#cascading-and-hierarchy
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
    'regex',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'import/order': [
      'warn',
      {
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: '^/**',
            group: 'parent',
            position: 'before',
          },
          {
            pattern: '~/**',
            group: 'parent',
            position: 'before',
          },
        ],
        alphabetize: {
          order: 'asc',
        },
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
      },
    ],
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
    'jest/no-standalone-expect': [
      'error',
      { additionalTestBlockFunctions: ['each.test'] },
    ],
    'regex/invalid': ['error', [
      {
        regex: '\\?\\<\\!',
        message: 'Do not use any negative lookbehind',
      }, {
        regex: '\\?\\<\\=',
        message: 'Do not use any Positive lookbehind',
      },
    ]],
  },
};
