/**
 * == Notes for production build==
 * The modules required from this file must be transpiled before running `next build`.
 *
 * See: https://github.com/vercel/next.js/discussions/35969#discussioncomment-2522954
 */

const { withSuperjson } = require('next-superjson');
const { PHASE_PRODUCTION_SERVER } = require('next/constants');


// define additional entries
const additionalWebpackEntries = {
  boot: './src/client/boot',
};


const setupTranspileModules = () => {
  const eazyLogger = require('eazy-logger');
  const { listScopedPackages, listPrefixedPackages } = require('./src/utils/next.config.utils');

  // setup logger
  const logger = eazyLogger.Logger({
    prefix: '[{green:next.config.js}] ',
    useLevelPrefixes: false,
  });

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


module.exports = async(phase, { defaultConfig }) => {

  const { i18n, localePath } = phase === PHASE_PRODUCTION_SERVER
    ? require('./dist/next-i18next.config')
    : require('./src/next-i18next.config');

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    // == DOES NOT WORK
    // see: https://github.com/vercel/next.js/discussions/27876
    // experimental: { esmExternals: true }, // Prefer loading of ES Modules over CommonJS

    reactStrictMode: true,
    swcMinify: true,
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

  // production server
  if (phase === PHASE_PRODUCTION_SERVER) {
    return withSuperjson()(nextConfig);
  }

  const withTM = setupTranspileModules();
  return withSuperjson()(withTM(nextConfig));
};
