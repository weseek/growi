const path = require('path');
const withSass = require('@zeit/next-sass');

module.exports = withSass({
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
});
