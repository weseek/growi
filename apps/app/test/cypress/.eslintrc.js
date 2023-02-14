module.exports = {
  root: true,
  extends: [
    'weseek/typescript',
    'plugin:cypress/recommended',
  ],
  plugins: ['@typescript-eslint', 'cypress'],
};
