module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'weseek/react',
  ],
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};
