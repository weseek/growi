const path = require('path');

module.exports = {
  poweredByHeader: false,
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(__dirname, './src'), // src
      '^': path.resolve(__dirname, './'), // project root
      '@alias/logger': path.resolve(__dirname, './src/utils/logger'), // alias for logger
    };
    return config;
  },
};
