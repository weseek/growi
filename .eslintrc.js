module.exports = {
  parser: 'babel-eslint',
  extends: [
    'airbnb',
    'plugin:react/recommended'
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jquery: true,
  },
  globals: {
    $: true,
    jquery: true,
    emojione: true,
    hljs: true,
    window: true,
  },
  plugins: [
    'react',
    'chai-friendly',
  ],
  rules: {
    "arrow-body-style": ["error", "always"],
    "brace-style": [
      "error",
      "stroustrup",
      { "allowSingleLine": true },
    ],
    'class-methods-use-this': 'off',
    'consistent-return': 'off',
    'func-names': 'off',
    "global-require": 'off',
    "key-spacing": [
      'error',
      { 'mode': 'minimum' }
    ],
    "max-len": ['error',
      {
        code: 160,
        ignoreTrailingComments: true
      }
    ],
    'no-continue': 'off',
    "no-param-reassign": [
      "error",
      { "props": false }
    ],
    "no-plusplus": [
      "error",
      { "allowForLoopAfterthoughts": true }
    ],
    // Allow only for-of
    // https://qiita.com/the_red/items/0c826e97b57da6d67621
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-shadow': 'off',
    'no-underscore-dangle': 'off',
    'no-useless-return': 'off',
    "prefer-destructuring": 'off',
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1,
        "ignoredNodes": ['JSXElement *', 'JSXElement', "JSXAttribute", "JSXSpreadAttribute"],
        "ArrayExpression": "first",
        "FunctionDeclaration": {"body": 1, "parameters": 2},
        "FunctionExpression": {"body": 1, "parameters": 2},
        "MemberExpression": "off"
      }
    ],
    // "key-spacing": [
    //   "error", {
    //     "beforeColon": false,
    //     "afterColon": true,
    //     "mode": "minimum"
    //   }
    // ],
    // "keyword-spacing": [
    //   "error", {}
    // ],
    // "linebreak-style": [
    //   "error",
    //   "unix"
    // ],
    "no-unused-vars": [
      "error",
      { "args": "none" }
    ],
    'react/destructuring-assignment': 'off',
    'react/forbid-prop-types': 'off',
    'react/no-unused-prop-types': 'off',
    'react/require-default-props': 'off',
    'react/sort-comp': 'off',
    // "react/jsx-uses-vars": 1,
    // "react/no-string-refs": "off",
    "semi": [
      "error",
      "always",
      { "omitLastInOneLineBlock": true }
    ],
    // "space-before-blocks": [
    //   "error",
    //   "always"
    // ],
    "space-before-function-paren": [
      "error",
      "never"
    ],
    "import/no-extraneous-dependencies": 'off',
    "import/no-dynamic-require": 'off',
    "import/no-unresolved": [2, { ignore: ['^@'] }],  // ignore @alias/..., @commons/..., ...
    // eslint-plugin-chai-friendly rules
    "no-unused-expressions": 0,
    "chai-friendly/no-unused-expressions": 2,
  },
};
