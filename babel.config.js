module.exports = function(api) {
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-react',
  ];
  const plugins = [
    'lodash',
    // transform
    //  from `import { Button } from 'reactstrap';`
    //  to   `import Row from 'reactstrap/Button';`
    [
      'transform-imports', {
        reactstrap: {
          // eslint-disable-next-line no-template-curly-in-string
          transform: 'reactstrap/es/${member}',
          preventFullImport: true,
        },
      },
    ],
    '@babel/plugin-proposal-optional-chaining',
    [
      '@babel/plugin-proposal-class-properties', { loose: true },
    ],
  ];

  return {
    presets,
    plugins,
  };
};
