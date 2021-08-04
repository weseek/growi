module.exports = {
  extends: [
    'weseek/react',
    'weseek/typescript',
  ],
  env: {
    jquery: true,
  },
  globals: {
    $: true,
    jquery: true,
    emojione: true,
    hljs: true,
    ScrollPosStyler: true,
    window: true,
  },
  settings: {
    // resolve path aliases by eslint-import-resolver-typescript
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    'no-restricted-imports': ['error', {
      name: 'axios',
      message: 'Please use src/utils/axios instead.',
    }],
    // set 'warn' temporarily -- 2021.08.02 Yuki Takei
    '@typescript-eslint/explicit-module-boundary-types': ['warn'],
    '@typescript-eslint/no-use-before-define': ['warn'],
    '@typescript-eslint/no-this-alias': ['warn'],
    '@typescript-eslint/no-var-requires': ['warn'],
    'jest/no-done-callback': ['warn'],
  },
};
