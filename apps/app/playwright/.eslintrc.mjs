import playwright from 'eslint-plugin-playwright';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  root: true,
  ...playwright.configs['flat/recommended'],
  files: ['./**'],
  rules: {
    // Customize Playwright rules
    // ...
  },
  extends: ['weseek/typescript'],
  plugins: ['@typescript-eslint'],
};
