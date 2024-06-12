import playwright from 'eslint-plugin-playwright';

// eslint-disable-next-line import/no-anonymous-default-export
export default [
  {
    ...playwright.configs['flat/recommended'],
    files: ['./**'],
    rules: {
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',

        },
      ],
    },
    settings: {
      // resolve path aliases by eslint-import-resolver-typescript
      'import/resolver': {
        typescript: {},
      },
    },
  },
  {
    files: ['./**'],
    rules: {
      // Customize Playwright rules
      // ...
    },
  },
];
