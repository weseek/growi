import eazyLogger from 'eazy-logger';
import { I18NextHMRPlugin } from 'i18next-hmr/plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';

import { i18n, localePath } from './src/next-i18next.config';
import { listScopedPackages, listPrefixedPackages } from './src/utils/next.config.utils';


// setup logger
const logger = eazyLogger.Logger({
  prefix: '[{green:next.config.js}] ',
  useLevelPrefixes: false,
});


const setupWithTM = () => {
  // define transpiled packages for '@growi/*'
  const packages = [
    ...listScopedPackages(['@growi'], { ignorePackageNames: '@growi/app' }),
    // listing ESM packages until experimental.esmExternals works correctly to avoid ERR_REQUIRE_ESM
    'react-markdown',
    'unified',
    'comma-separated-tokens',
    'decode-named-character-reference',
    'space-separated-tokens',
    'trim-lines',
    ...listPrefixedPackages(['remark-', 'rehype-', 'hast-', 'mdast-', 'micromark-', 'micromark-', 'unist-']),
  ];

  logger.info('{bold:Listing scoped packages for transpiling:}');
  logger.unprefixed('info', `{grey:${JSON.stringify(packages, null, 2)}}`);

  return require('next-transpile-modules')(packages);
};
const withTM = setupWithTM();


// define additional entries
const additionalWebpackEntries = {
  boot: './src/client/boot',
};


/** @type {import('next').NextConfig} */
const nextConfig = {
  // == DOES NOT WORK
  // see: https://github.com/vercel/next.js/discussions/27876
  // experimental: { esmExternals: true }, // Prefer loading of ES Modules over CommonJS

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

    config.plugins.push(
      new WebpackManifestPlugin({
        fileName: 'custom-manifest.json',
      }),
    );

    // setup i18next-hmr
    if (!options.isServer && options.dev) {
      config.plugins.push(new I18NextHMRPlugin({ localesDir: localePath }));
    }

    return config;
  },

};

module.exports = withTM(nextConfig);
