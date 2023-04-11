/**
 * == Notes for production build==
 * The modules required from this file must be transpiled before running `next build`.
 *
 * See: https://github.com/vercel/next.js/discussions/35969#discussioncomment-2522954
 */

const { withSuperjson } = require('next-superjson');
const { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } = require('next/constants');


const getTranspilePackages = () => {
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
    'react-markdown-customkeyprop',
    'unified',
    'markdown-table',
    'character-entities-html4',
    'comma-separated-tokens',
    'decode-named-character-reference',
    'hastscript',
    'html-void-elements',
    'is-absolute-url',
    'longest-streak',
    'property-information',
    'space-separated-tokens',
    'stringify-entities',
    'trim-lines',
    'trough',
    'web-namespaces',
    'vfile',
    'vfile-location',
    'vfile-message',
    'zwitch',
    'emoticon',
    'direction', // for hast-util-select
    'bcp-47-match', // for hast-util-select
    ...listPrefixedPackages(['remark-', 'rehype-', 'hast-', 'mdast-', 'micromark-', 'unist-']),
  ];

  // logger.info('{bold:Listing scoped packages for transpiling:}');
  // logger.unprefixed('info', `{grey:${JSON.stringify(packages, null, 2)}}`);

  return packages;
};


module.exports = async(phase, { defaultConfig }) => {

  const { i18n, localePath } = require('./config/next-i18next.config');

  /** @type {import('next').NextConfig} */
  const nextConfig = {

    reactStrictMode: true,
    poweredByHeader: false,
    pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
    i18n,

    // for build
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      tsconfigPath: 'tsconfig.build.client.json',
    },
    transpilePackages: phase !== PHASE_PRODUCTION_SERVER
      ? getTranspilePackages()
      : undefined,

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
      config.externals.push('mongoose');

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

  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: phase === PHASE_PRODUCTION_BUILD || process.env.ANALYZE === 'true',
  });

  return withBundleAnalyzer(withSuperjson()(nextConfig));
};
