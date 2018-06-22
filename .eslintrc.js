module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "globals": {
    "$": true,
    "jquery": true,
    "emojione": true,
    "hljs": true,
    "window": true
  },
  "parserOptions": {
    "ecmaVersion": 8,
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "brace-style": [
      "error",
      "stroustrup", { "allowSingleLine": true }
    ],
    "comma-spacing": [
      "error",
      { "before": false, "after": true }
    ],
    "func-call-spacing": [
      "error",
      "never"
    ],
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1,
        "ignoredNodes": ['JSXElement *', 'JSXElement', "JSXAttribute", "JSXSpreadAttribute"],
        "FunctionDeclaration": {"body": 1, "parameters": 2},
        "FunctionExpression": {"body": 1, "parameters": 2},
        "MemberExpression": "off"
      }
    ],
    "key-spacing": [
      "error", {
        "beforeColon": false,
        "afterColon": true,
        "mode": "minimum"
      }
    ],
    "keyword-spacing": [
      "error", {}
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-unused-vars": [
      "error",
      { "args": "none" }
    ],
    "no-var": [ "error" ],
    "quotes": [
      "error",
      "single"
    ],
    "react/jsx-uses-vars": 1,
    "react/no-string-refs": "off",
    "semi": [
      "error",
      "always",
      { "omitLastInOneLineBlock": true }
    ],
    "space-before-blocks": [
      "error",
      "always"
    ],
    "space-before-function-paren": [
      "error",
      "never"
    ]
  }
};
