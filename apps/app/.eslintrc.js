module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      generators: false,
      objectLiteralDuplicateProperties: false,
    },
    requireConfigFile: false,
    sourceType: 'module',
    allowImportExportEverywhere: true,
    babelOptions: {
      presets: [
        'next/babel',
      ],
      caller: {
        supportsTopLevelAwait: true,
      },
    },
    ecmaVersion: 2018,
  },
  plugins: [
    '@typescript-eslint',
    'regex',
    'jsx-a11y',
    'import',
    '@next/next',
    'react-hooks',
    'react',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
      typescript: {
        alwaysTryTypes: true,
      },
    },
    react: {
      pragma: 'React',
      version: '16.0',
    },
    propWrapperFunctions: [
      'forbidExtraProps',
      'exact',
      'Object.freeze',
    ],
    'import/parsers': {
      '@typescript-eslint/parser': [
        '.ts',
        '.tsx',
        '.d.ts',
      ],
    },
    'import/extensions': [
      '.js',
      '.mjs',
      '.jsx',
    ],
    'import/ignore': [
      'node_modules',
      '\\.(coffee|scss|css|less|hbs|svg|json)$',
    ],
  },
  ignorePatterns: [
    '/dist/**',
    '/transpiled/**',
    '/public/**',
    '/src/linter-checker/**',
    '/tmp/**',
    '/next-env.d.ts',
  ],
  rules: {
    'import/no-anonymous-default-export': [
      'warn',
      {
        allowArray: false,
        allowArrowFunction: false,
        allowAnonymousClass: false,
        allowAnonymousFunction: false,
        allowLiteral: false,
        allowObject: false,
      },
    ],
    'jsx-quotes': [
      'error',
      'prefer-double',
    ],
    'react/prop-types': [
      'warn',
      {
        ignore: [],
        customValidators: [],
        skipUndeclared: false,
      },
    ],
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: [
          '.jsx',
          '.tsx',
        ],
      },
    ],
    'react/jsx-boolean-value': [
      'error',
      'never',
      {
        always: [],
      },
    ],
    'react/jsx-closing-bracket-location': [
      'error',
      'line-aligned',
    ],
    'react/jsx-closing-tag-location': [
      'error',
    ],
    'react/jsx-curly-spacing': [
      'error',
      'never',
      {
        allowMultiline: true,
      },
    ],
    'react/jsx-indent-props': [
      'error',
      2,
    ],
    'react/jsx-max-props-per-line': [
      'error',
      {
        maximum: 1,
        when: 'multiline',
      },
    ],
    'react/jsx-no-bind': [
      'error',
      {
        ignoreRefs: true,
        allowArrowFunctions: true,
        allowFunctions: false,
        allowBind: false,
        ignoreDOMComponents: true,
      },
    ],
    'react/jsx-no-undef': [
      'error',
    ],
    'react/jsx-pascal-case': [
      'error',
      {
        allowAllCaps: true,
        ignore: [],
      },
    ],
    'react/jsx-uses-react': [
      'error',
    ],
    'react/jsx-uses-vars': [
      'error',
    ],
    'react/no-deprecated': [
      'error',
    ],
    'react/no-did-update-set-state': [
      'error',
    ],
    'react/no-will-update-set-state': [
      'error',
    ],
    'react/no-is-mounted': [
      'error',
    ],
    'react/no-multi-comp': [
      'error',
      {
        ignoreStateless: true,
      },
    ],
    'react/no-string-refs': [
      'error',
    ],
    'react/no-unknown-property': [
      'error',
    ],
    'react/prefer-es6-class': [
      'error',
      'always',
    ],
    'react/require-render-return': [
      'error',
    ],
    'react/jsx-wrap-multilines': [
      'error',
      {
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        condition: 'parens-new-line',
        logical: 'parens-new-line',
        prop: 'parens-new-line',
      },
    ],
    'react/jsx-first-prop-new-line': [
      'error',
      'multiline-multiprop',
    ],
    'react/jsx-equals-spacing': [
      'error',
      'never',
    ],
    'react/jsx-indent': [
      'error',
      2,
    ],
    'react/no-render-return-value': [
      'error',
    ],
    'react/no-find-dom-node': [
      'error',
    ],
    'react/style-prop-object': [
      'error',
    ],
    'react/no-unescaped-entities': [
      'error',
    ],
    'react/jsx-tag-spacing': [
      'error',
      {
        closingSlash: 'never',
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        beforeClosing: 'never',
      },
    ],
    'react/forbid-foreign-prop-types': [
      'warn',
      {
        allowInPropTypes: true,
      },
    ],
    'react/default-props-match-prop-types': [
      'error',
      {
        allowRequiredDefaults: false,
      },
    ],
    'react/no-redundant-should-component-update': [
      'error',
    ],
    'react/no-unused-state': [
      'error',
    ],
    'react/no-typos': [
      'error',
    ],
    'react/no-this-in-sfc': [
      'error',
    ],
    'react/jsx-props-no-multi-spaces': [
      'error',
    ],
    '@next/next/no-sync-scripts': [
      2,
    ],
    '@next/next/no-html-link-for-pages': [
      2,
    ],
    '@next/next/no-css-tags': [
      1,
    ],
    '@next/next/no-unwanted-polyfillio': [
      1,
    ],
    '@next/next/no-page-custom-font': [
      1,
    ],
    '@next/next/no-title-in-document-head': [
      1,
    ],
    '@next/next/google-font-preconnect': [
      1,
    ],
    '@next/next/next-script-for-ga': [
      1,
    ],
    '@next/next/no-script-component-in-head': [
      2,
    ],
    '@next/next/no-server-import-in-page': [
      2,
    ],
    '@next/next/no-typos': [
      1,
    ],
    '@next/next/no-duplicate-head': [
      2,
    ],
    '@next/next/inline-script-id': [
      2,
    ],
    '@next/next/no-before-interactive-script-outside-document': [
      1,
    ],
    '@next/next/no-assign-module-variable': [
      2,
    ],
  },
};
