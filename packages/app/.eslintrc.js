module.exports = {
  extends: [
    'weseek/react',
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
  },
};
