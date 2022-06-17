import { listScopedPackages } from './src/utils/next.config.utils';

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

  webpack(config, options) {

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
