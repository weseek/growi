/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */
const webpack = require('webpack');
const helpers = require('../src/lib/util/helpers');

/*
 * Webpack Plugins
 */
const WebpackAssetsManifest = require('webpack-assets-manifest');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = (options) => {
  return {
    mode: options.mode,
    entry: Object.assign({
      'js/app':                       './src/client/js/app',
      'js/legacy':                    './src/client/js/legacy/crowi',
      'js/legacy-admin':              './src/client/js/legacy/crowi-admin',
      'js/legacy-presentation':       './src/client/js/legacy/crowi-presentation',
      'js/plugin':                    './src/client/js/plugin',
      'js/ie11-polyfill':             './src/client/js/ie11-polyfill',
      'js/hackmd-agent':              './src/client/js/hackmd-agent',
      'js/hackmd-styles':             './src/client/js/hackmd-styles',
      // styles
      'styles/style':                 './src/client/styles/scss/style.scss',
      'styles/style-presentation':    './src/client/styles/scss/style-presentation.scss',
      // themes
      'styles/theme-default':         './src/client/styles/scss/theme/default.scss',
      'styles/theme-default-dark':    './src/client/styles/scss/theme/default-dark.scss',
      'styles/theme-nature':          './src/client/styles/scss/theme/nature.scss',
      'styles/theme-mono-blue':       './src/client/styles/scss/theme/mono-blue.scss',
      'styles/theme-future':          './src/client/styles/scss/theme/future.scss',
      'styles/theme-blue-night':      './src/client/styles/scss/theme/blue-night.scss',
      // styles for external services
      'styles/style-hackmd':          './src/client/styles/hackmd/style.scss',
    }, options.entry || {}),  // Merge with env dependent settings
    output: Object.assign({
      path: helpers.root('public'),
      publicPath: '/',
      filename: '[name].bundle.js',
    }, options.output || {}), // Merge with env dependent settings
    externals: {
      // require("jquery") is external and available
      //  on the global var jQuery
      'jquery': 'jQuery',
      'emojione': 'emojione',
      'hljs': 'hljs',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      modules: [helpers.root('node_modules')],
      alias: {
        '@root': helpers.root('/'),
        '@commons': helpers.root('src/lib'),
        '@tmp': helpers.root('tmp'),
        '@alias/logger': helpers.root('src/lib/service/logger'),
        '@alias/locales': helpers.root('resource/locales'),
        // replace bunyan
        'bunyan': 'browser-bunyan',
      }
    },
    module: {
      rules: options.module.rules.concat([
        {
          test: /.jsx?$/,
          exclude: {
            test:    helpers.root('node_modules'),
            exclude: [  // include as a result
              helpers.root('node_modules/string-width'),
              helpers.root('node_modules/is-fullwidth-code-point'), // depends from string-width
            ]
          },
          use: [{
            loader: 'babel-loader?cacheDirectory'
          }]
        },
        {
          test: /locales/,
          loader: '@alienfast/i18next-loader',
          options: {
            basenameAsNamespace: true,
          }
        },
        { // see https://github.com/abpetkov/switchery/issues/120
          test: /switchery\.js$/,
          loader: 'imports-loader?module=>false,exports=>false,define=>false,this=>window'
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
          exclude: [helpers.root('src/client/styles')]
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          exclude: [helpers.root('src/client/styles')]
        },
        /*
         * File loader for supporting images, for example, in CSS files.
         */
        {
          test: /\.(jpg|png|gif)$/,
          use: 'file-loader',
        },
        /* File loader for supporting fonts, for example, in CSS files.
        */
        {
          test: /\.(eot|woff2?|svg|ttf)([?]?.*)$/,
          use: 'null-loader',
        }
      ])
    },
    plugins: options.plugins.concat([

      new WebpackAssetsManifest({ publicPath: true }),

      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),

      // ignore
      new webpack.IgnorePlugin(/^\.\/lib\/deflate\.js/, /markdown-it-plantuml/),

      new LodashModuleReplacementPlugin({
        flattening: true
      }),

      new webpack.ProvidePlugin({ // refs externals
        jQuery: 'jquery',
        $: 'jquery',
      }),

    ]),

    devtool: options.devtool,
    target: 'web', // Make web variables accessible to webpack, e.g. window
    optimization: {
      namedModules: true,
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /src/,
            chunks: 'initial',
            name: 'js/commons',
            minChunks: 2,
            minSize: 1,
            priority: 20
          },
          vendors: {
            test: /node_modules/,
            chunks: (chunk) => {
              // ignore patterns
              return chunk.name != null && !chunk.name.match(/legacy-presentation|ie11-polyfill|hackmd-/);
            },
            name: 'js/vendors',
            // minChunks: 2,
            minSize: 1,
            priority: 10,
            enforce: true
          }
        }
      },
      minimizer: options.optimization.minimizer || [],
    },
    performance: options.performance || {},
    stats: options.stats || {},
  };
};
