const path = require('path');

// define additional entries
const additionalWebpackEntries = {
  boot: './src/client/js/boot',
};

module.exports = {
  poweredByHeader: false,

  // Runtime Configuration
  // see: https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
  },

  webpack(config, options) {

    // See: https://webpack.js.org/configuration/node/
    // This allows code originally written for the Node.js environment to run in other environments like the browser.
    config.node = {
      ...config.node,
      fs: 'empty',
    };

    // See: https://webpack.js.org/configuration/externals/
    // This provides a way of excluding dependencies from the output bundles
    config.externals.push('dtrace-provider');

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
    };

    // configure plugins
    const WebpackAssetsManifest = require('webpack-assets-manifest');
    config.plugins.push(
      new WebpackAssetsManifest({
        publicPath: true,
        output: 'custom-manifest.json',
      }),
    );

    if (!options.isServer && config.mode === 'development') {
      const { I18NextHMRPlugin } = require('i18next-hmr/plugin');
      config.plugins.push(
        new I18NextHMRPlugin({
          localesDir: path.resolve(__dirname, 'public/static/locales'),
        }),
      );
    }

    return config;
  },
};
