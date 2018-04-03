module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
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
      { "SwitchCase": 1 }
    ],
    "key-spacing": [
      "error", { "beforeColon": false, "afterColon": true }
    ],
    "keyword-spacing": [
      "error", {}
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
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
