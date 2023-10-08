module.exports = {
  extends: ['next/core-web-vitals', 'weseek/react'],
  plugins: [],
  settings: {},
  rules: {
    'no-restricted-imports': [
      'error',
      {
        name: 'axios',
        message: 'Please use src/utils/axios instead.',
      },
    ],
    '@typescript-eslint/no-use-before-define': ['warn'],
  },
};
