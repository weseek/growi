import { listScopedPackages } from './src/utils/next.config.utils';

import { i18n } from './src/next-i18next.config';

// define transpiled packages for '@growi/*'
const scopedPackages = listScopedPackages(['@growi']);
const withTM = require('next-transpile-modules')(scopedPackages);

// define additional entries
const additionalWebpackEntries = {
  boot: './src/client/boot',
};


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: 'tsconfig.build.client.json',
  },
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],

  i18n,

  /** @param config {import('next').NextConfig} */
  webpack(config, options) {

    // Avoid "Module not found: Can't resolve 'fs'"
    // See: https://stackoverflow.com/a/68511591
    if (!options.isServer) {
      config.resolve.fallback.fs = false;
    }

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

    // configure plugins
    const WebpackAssetsManifest = require('webpack-assets-manifest');
    config.plugins.push(
      new WebpackAssetsManifest({
        publicPath: true,
        output: 'custom-manifest.json',
      }),
    );

    return config;
  },

};

module.exports = withTM(nextConfig);
