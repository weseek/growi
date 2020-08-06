module.exports = {
  plugins:
    process.env.NODE_ENV === 'production'
      // production settings
      ? [
        'postcss-flexbugs-fixes',
        [
          'postcss-preset-env',
          {
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
            features: {
              'custom-properties': false,
            },
          },
        ],
      ]
      // development settings
      : [
      ],
};
