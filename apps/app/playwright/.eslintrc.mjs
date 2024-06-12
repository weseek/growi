import playwright from 'eslint-plugin-playwright';

// eslint-disable-next-line import/no-anonymous-default-export
export default [
  {
    ...playwright.configs['flat/recommended'],
    files: ['./**'],
  },
  {
    files: ['./**'],
    rules: {
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
        },
      ],
      'import/no-unresolved': 'off',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
];
