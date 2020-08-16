const path = require('path');

const WebpackAssetsManifest = require('webpack-assets-manifest');

// define additional entries
const additionalWebpackEntries = {
  boot: './src/client/js/boot',
};

module.exports = {
  poweredByHeader: false,
  webpack(config) {

    // configure additional entries
    const orgEntry = config.entry;
    config.entry = () => {
      return orgEntry().then((entry) => {
        return { ...entry, ...additionalWebpackEntries };
      });
    };

    // configure alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(__dirname, './src'), // src
      '^': path.resolve(__dirname, './'), // project root
      '@alias/logger': path.resolve(__dirname, './src/utils/logger'), // alias for logger
    };

    // configure plugins
    config.plugins.push(
      new WebpackAssetsManifest({
        publicPath: true,
        output: 'custom-manifest.json',
      }),
    );

    return config;
  },
};
