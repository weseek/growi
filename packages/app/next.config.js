/**
 * == Notes for production build==
 * The modules required from this file must be transpiled before running `next build`.
 *
 * See: https://github.com/vercel/next.js/discussions/35969#discussioncomment-2522954
 */

const eazyLogger = require('eazy-logger');
const { withSuperjson } = require('next-superjson');

const { i18n, localePath } = require('./src/next-i18next.config');


const isProduction = process.env.NODE_ENV === 'production';
const isBuildingNext = process.env.BUILDING_NEXT === 'true';


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

    const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
    config.plugins.push(
      new WebpackManifestPlugin({
        fileName: 'custom-manifest.json',
      }),
    );

    // setup i18next-hmr
    if (!options.isServer && options.dev) {
      const { I18NextHMRPlugin } = require('i18next-hmr/plugin');
      config.plugins.push(new I18NextHMRPlugin({ localesDir: localePath }));
    }

    return config;
  },

};


const passThrough = nextConfig => nextConfig;
let withTM = passThrough;

if (!isProduction || isBuildingNext) {
  const { listScopedPackages, listPrefixedPackages } = require('./src/utils/next.config.utils');

  // setup logger
  const logger = eazyLogger.Logger({
    prefix: '[{green:next.config.js}] ',
    useLevelPrefixes: false,
  });

  const setupWithTM = () => {
    // define transpiled packages for '@growi/*'
    const packages = [
      ...listScopedPackages(['@growi'], { ignorePackageNames: ['@growi/app'] }),
      // listing ESM packages until experimental.esmExternals works correctly to avoid ERR_REQUIRE_ESM
      'react-markdown',
      'unified',
      'comma-separated-tokens',
      'decode-named-character-reference',
      'html-void-elements',
      'property-information',
      'space-separated-tokens',
      'trim-lines',
      'web-namespaces',
      'vfile',
      'zwitch',
      'emoticon',
      ...listPrefixedPackages(['remark-', 'rehype-', 'hast-', 'mdast-', 'micromark-', 'micromark-', 'unist-']),
    ];

    logger.info('{bold:Listing scoped packages for transpiling:}');
    logger.unprefixed('info', `{grey:${JSON.stringify(packages, null, 2)}}`);

    return require('next-transpile-modules')(packages);
  };

  withTM = setupWithTM();
}

module.exports = withSuperjson()(withTM(nextConfig));
