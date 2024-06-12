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
      // Customize Playwright rules
      // ...
    },
  },
];
