/**
 * == Notes for production build==
 * The modules required from this file must be transpiled before running `next build`.
 *
 * See: https://github.com/vercel/next.js/discussions/35969#discussioncomment-2522954
 */

const path = require('path');

const { withSuperjson } = require('next-superjson');
const { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } = require('next/constants');


const getTranspilePackages = () => {
  const { listPrefixedPackages } = require('./src/utils/next.config.utils');

  const packages = [
    // listing ESM packages until experimental.esmExternals works correctly to avoid ERR_REQUIRE_ESM
    'react-markdown',
    'unified',
    'markdown-table',
    'bail',
    'ccount',
    'character-entities',
    'character-entities-html4',
    'character-entities-legacy',
    'comma-separated-tokens',
    'decode-named-character-reference',
    'escape-string-regexp',
    'hastscript',
    'html-void-elements',
    'is-absolute-url',
    'is-plain-obj',
    'longest-streak',
    'micromark',
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

  // const eazyLogger = require('eazy-logger');
  // const logger = eazyLogger.Logger({
  //   prefix: '[{green:next.config.js}] ',
  //   useLevelPrefixes: false,
  // });
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
      if (!options.isServer) {
        // Avoid "Module not found: Can't resolve 'fs'"
        // See: https://stackoverflow.com/a/68511591
        config.resolve.fallback.fs = false;

        // exclude packages from the output bundles
        config.module.rules.push(
          ...[
            /dtrace-provider/,
            /mongoose/,
            /mathjax-full/, // required from marp
          ].map((packageRegExp) => {
            return {
              test: packageRegExp,
              use: 'null-loader',
            };
          }),
        );

        // setup for react-pdf
        // see: https://github.com/wojtekmaj/react-pdf#support-for-non-latin-characters
        const CopyWebpackPlugin = require('copy-webpack-plugin');
        const cMapsDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps');
        const standardFontsDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts');
        config.plugins.push(
          new CopyWebpackPlugin({
            patterns: [
              {
                from: cMapsDir,
                to: 'static/media/cmaps/',
              },
              {
                from: standardFontsDir,
                to: 'static/media/standard_fonts/',
              },
            ],
          }),
        );
        // see: https://zenn.dev/kin/articles/658b06a3233e60#react-pdf%E5%88%9D%E6%9C%9F%E8%A8%AD%E5%AE%9A
        config.module.rules.unshift({
          test: /pdf\.worker\.(min\.)?js/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[contenthash].[ext]',
              publicPath: '_next/static/chunks',
              outputPath: 'static/chunks',
            },
          }],
        });
      }

      // extract sourcemap
      if (options.dev) {
        config.module.rules.push({
          test: /.(c|m)?js$/,
          exclude: [/node_modules/, path.resolve(__dirname)],
          enforce: 'pre',
          use: ['source-map-loader'],
        });
      }

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
