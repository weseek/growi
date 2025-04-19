module.exports = {
  root: true, // https://eslint.org/docs/user-guide/configuring/configuration-files#cascading-and-hierarchy
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    ecmaFeatures: {
      generators: false,
      objectLiteralDuplicateProperties: false,
    },
  },
  plugins: [
    'import',
    '@typescript-eslint',
    'regex',
  ],
  ignorePatterns: [
    'node_modules/**',
  ],
  rules: {
    'regex/invalid': [
      'error',
      [
        {
          regex: '\\?\\<\\!',
          message: 'Do not use any negative lookbehind',
        },
        {
          regex: '\\?\\<\\=',
          message: 'Do not use any Positive lookbehind',
        },
      ],
    ],
    '@typescript-eslint/ban-ts-comment': [
      'error',
    ],
    '@typescript-eslint/no-non-null-asserted-optional-chain': [
      'error',
    ],
    '@typescript-eslint/triple-slash-reference': [
      'error',
    ],
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
    'padded-blocks': [
      'error',
      {
        classes: 'always',
      },
    ],
    'space-before-function-paren': [
      'error',
      'never',
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-unresolved': [
      'error',
      {
        commonjs: true,
        caseSensitive: true,
        caseSensitiveStrict: false,
      },
    ],
    'import/named': [
      'error',
    ],
    'import/export': [
      'error',
    ],
    'import/no-named-as-default': [
      'error',
    ],
    'import/no-named-as-default-member': [
      'error',
    ],
    'import/first': [
      'error',
    ],
    'import/no-duplicates': [
      'error',
    ],
    'import/no-absolute-path': [
      'error',
    ],
    'no-mixed-operators': [
      'error',
      {
        groups: [
          [
            '%',
            '**',
          ],
          [
            '%',
            '+',
          ],
          [
            '%',
            '-',
          ],
          [
            '%',
            '*',
          ],
          [
            '%',
            '/',
          ],
          [
            '**',
            '+',
          ],
          [
            '**',
            '-',
          ],
          [
            '**',
            '*',
          ],
          [
            '**',
            '/',
          ],
          [
            '&',
            '|',
            '^',
            '~',
            '<<',
            '>>',
            '>>>',
          ],
          [
            '==',
            '!=',
            '===',
            '!==',
            '>',
            '>=',
            '<',
            '<=',
          ],
          [
            '&&',
            '||',
          ],
          [
            'in',
            'instanceof',
          ],
        ],
        allowSamePrecedence: false,
      },
    ],
    'arrow-parens': [
      'error',
      'as-needed',
      {
        requireForBlockBody: true,
      },
    ],
    'arrow-spacing': [
      'error',
      {
        before: true,
        after: true,
      },
    ],
    'import/newline-after-import': [
      'error',
    ],
    'import/no-webpack-loader-syntax': [
      'error',
    ],
    'import/no-named-default': [
      'error',
    ],
    'import/no-self-import': [
      'error',
    ],
    'import/no-cycle': [
      'error',
      {
        maxDepth: null,
        ignoreExternal: false,
      },
    ],
    'import/no-useless-path-segments': [
      'error',
    ],
    'generator-star-spacing': [
      'error',
      {
        before: false,
        after: true,
      },
    ],
    'object-shorthand': [
      'error',
      'always',
      {
        ignoreConstructors: false,
        avoidQuotes: true,
      },
    ],
    'prefer-spread': [
      'error',
    ],
    'rest-spread-spacing': [
      'error',
      'never',
    ],
    'symbol-description': [
      'error',
    ],
    'template-curly-spacing': [
      'error',
    ],
    'no-new': [
      'error',
    ],
    'no-new-func': [
      'error',
    ],
    'yield-star-spacing': [
      'error',
      'after',
    ],
    'array-bracket-spacing': [
      'error',
      'never',
    ],
    'block-spacing': [
      'error',
      'always',
    ],
    'comma-spacing': [
      'error',
      {
        before: false,
        after: true,
      },
    ],
    'comma-style': [
      'error',
      'last',
      {
        exceptions: {
          ArrayExpression: false,
          ArrayPattern: false,
          ArrowFunctionExpression: false,
          CallExpression: false,
          FunctionDeclaration: false,
          FunctionExpression: false,
          ImportDeclaration: false,
          ObjectExpression: false,
          ObjectPattern: false,
          VariableDeclaration: false,
          NewExpression: false,
        },
      },
    ],
    'computed-property-spacing': [
      'error',
      'never',
    ],
    'eol-last': [
      'error',
      'always',
    ],
    'func-call-spacing': [
      'error',
      'never',
    ],
    'function-paren-newline': [
      'error',
      'consistent',
    ],
    'implicit-arrow-linebreak': [
      'error',
      'beside',
    ],
    'keyword-spacing': [
      'error',
      {
        before: true,
        after: true,
        overrides: {
          return: {
            after: true,
          },
          throw: {
            after: true,
          },
          case: {
            after: true,
          },
        },
      },
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterSingleLine: false,
      },
    ],
    'lines-around-directive': [
      'error',
      {
        before: 'always',
        after: 'always',
      },
    ],
    'new-cap': [
      'error',
      {
        newIsCap: true,
        newIsCapExceptions: [],
        capIsNew: false,
        capIsNewExceptions: [
          'Immutable.Map',
          'Immutable.Set',
          'Immutable.List',
        ],
        properties: true,
      },
    ],
    'new-parens': [
      'error',
    ],
    'newline-per-chained-call': [
      'error',
      {
        ignoreChainWithDepth: 4,
      },
    ],
    'no-mixed-spaces-and-tabs': [
      'error',
    ],
    'no-multiple-empty-lines': [
      'error',
      {
        max: 2,
        maxEOF: 0,
      },
    ],
    'no-new-object': [
      'error',
    ],
    'no-spaced-func': [
      'error',
    ],
    'no-tabs': [
      'error',
    ],
    'no-trailing-spaces': [
      'error',
      {
        skipBlankLines: false,
        ignoreComments: false,
      },
    ],
    'no-whitespace-before-property': [
      'error',
    ],
    'nonblock-statement-body-position': [
      'error',
      'beside',
      {
        overrides: {},
      },
    ],
    'object-curly-spacing': [
      'error',
      'always',
    ],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          minProperties: 4,
          multiline: true,
          consistent: true,
        },
        ObjectPattern: {
          minProperties: 4,
          multiline: true,
          consistent: true,
        },
        ImportDeclaration: {
          minProperties: 4,
          multiline: true,
          consistent: true,
        },
        ExportDeclaration: {
          minProperties: 4,
          multiline: true,
          consistent: true,
        },
      },
    ],
    'object-property-newline': [
      'error',
      {
        allowAllPropertiesOnSameLine: true,
        allowMultiplePropertiesPerLine: false,
      },
    ],
    'operator-linebreak': [
      'error',
      'before',
      {
        overrides: {
          '=': 'none',
        },
      },
    ],
    'quote-props': [
      'error',
      'as-needed',
      {
        keywords: false,
        unnecessary: true,
        numbers: false,
      },
    ],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
    'semi-spacing': [
      'error',
      {
        before: false,
        after: true,
      },
    ],
    'semi-style': [
      'error',
      'last',
    ],
    'space-before-blocks': [
      'error',
    ],
    'space-in-parens': [
      'error',
      'never',
    ],
    'space-infix-ops': [
      'error',
    ],
    'space-unary-ops': [
      'error',
      {
        words: true,
        nonwords: false,
        overrides: {},
      },
    ],
    'spaced-comment': [
      'error',
      'always',
      {
        line: {
          exceptions: [
            '-',
            '+',
          ],
          markers: [
            '=',
            '!',
          ],
        },
        block: {
          exceptions: [
            '-',
            '+',
          ],
          markers: [
            '=',
            '!',
          ],
          balanced: true,
        },
      },
    ],
    'switch-colon-spacing': [
      'error',
      {
        after: true,
        before: false,
      },
    ],
    'template-tag-spacing': [
      'error',
      'never',
    ],
    'unicode-bom': [
      'error',
      'never',
    ],
    'no-buffer-constructor': [
      'error',
    ],
    'no-new-require': [
      'error',
    ],
    'no-path-concat': [
      'error',
    ],
    'no-invalid-regexp': [
      'error',
    ],
    'no-unexpected-multiline': [
      'error',
    ],
    'array-callback-return': [
      'error',
      {
        allowImplicit: true,
        checkForEach: false,
      },
    ],
    'block-scoped-var': [
      'error',
    ],
    'dot-location': [
      'error',
      'property',
    ],
    'no-alert': [
      'warn',
    ],
    'no-caller': [
      'error',
    ],
    'no-extend-native': [
      'error',
    ],
    'no-extra-bind': [
      'error',
    ],
    'no-floating-decimal': [
      'error',
    ],
    'no-iterator': [
      'error',
    ],
    'no-loop-func': [
      'error',
    ],
    'no-multi-spaces': [
      'error',
      {
        ignoreEOLComments: false,
      },
    ],
    'no-multi-str': [
      'error',
    ],
    'no-octal': [
      'error',
    ],
    'no-proto': [
      'error',
    ],
    'no-restricted-properties': [
      'error',
      {
        object: 'arguments',
        property: 'callee',
        message: 'arguments.callee is deprecated',
      },
      {
        object: 'global',
        property: 'isFinite',
        message: 'Please use Number.isFinite instead',
      },
      {
        object: 'self',
        property: 'isFinite',
        message: 'Please use Number.isFinite instead',
      },
      {
        object: 'window',
        property: 'isFinite',
        message: 'Please use Number.isFinite instead',
      },
      {
        object: 'global',
        property: 'isNaN',
        message: 'Please use Number.isNaN instead',
      },
      {
        object: 'self',
        property: 'isNaN',
        message: 'Please use Number.isNaN instead',
      },
      {
        object: 'window',
        property: 'isNaN',
        message: 'Please use Number.isNaN instead',
      },
      {
        property: '__defineGetter__',
        message: 'Please use Object.defineProperty instead.',
      },
      {
        property: '__defineSetter__',
        message: 'Please use Object.defineProperty instead.',
      },
      {
        object: 'Math',
        property: 'pow',
        message: 'Use the exponentiation operator (**) instead.',
      },
    ],
    'no-return-assign': [
      'error',
      'always',
    ],
    'no-return-await': [
      'error',
    ],
    'no-script-url': [
      'error',
    ],
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: false,
        allowTernary: false,
        allowTaggedTemplates: false,
        enforceForJSX: false,
      },
    ],
    'prefer-promise-reject-errors': [
      'error',
      {
        allowEmptyReject: true,
      },
    ],
    'vars-on-top': [
      'error',
    ],
    'wrap-iife': [
      'error',
      'outside',
      {
        functionPrototypeMethods: false,
      },
    ],
    strict: [
      'error',
    ],
    'brace-style': [
      'error',
      'stroustrup',
      {
        allowSingleLine: true,
      },
    ],
    'no-bitwise': [
      'error',
    ],
    'no-await-in-loop': [
      'error',
    ],
  },
};
