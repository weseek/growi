/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

const webpack = require('webpack');
const helpers = require('./helpers');

/*
 * Webpack Plugins
 */
const AssetsPlugin = require('assets-webpack-plugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function(options) {
  return {
    entry: {
      'app':                  './resource/js/app',
      'legacy':               './resource/js/legacy/crowi',
      'legacy-form':          './resource/js/legacy/crowi-form',
      'legacy-admin':         './resource/js/legacy/crowi-admin',
      'legacy-presentation':  './resource/js/legacy/crowi-presentation',
      'plugin':               './resource/js/plugin',
      'style':                './resource/styles/scss/style.scss',
      'style-theme-default':  './resource/styles/scss/theme/default.scss',
      'style-theme-default-dark':  './resource/styles/scss/theme/default-dark.scss',
      'style-theme-nature':   './resource/styles/scss/theme/nature.scss',
      'style-theme-mono-blue':   './resource/styles/scss/theme/mono-blue.scss',
      'style-theme-future': './resource/styles/scss/theme/future.scss',
      'style-theme-blue-night': './resource/styles/scss/theme/blue-night.scss',
      'style-presentation':   './resource/styles/scss/style-presentation.scss',
    },
    externals: {
      // require("jquery") is external and available
      //  on the global var jQuery
      'jquery': 'jQuery',
      'emojione': 'emojione',
      'hljs': 'hljs',
    },
    resolve: {
      extensions: ['.js', '.json'],
      modules: [helpers.root('src'), helpers.root('node_modules')],
      alias: {
        '@root': helpers.root('/'),
        '@alias/logger': helpers.root('lib/service/logger'),
        '@alias/locales': helpers.root('lib/locales'),
        // replace bunyan
        'bunyan': 'browser-bunyan',
      }
    },
    module: {
      rules: [
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
            loader: 'babel-loader?cacheDirectory',
            options: {
              plugins: ['lodash'],
            }
          }]
        },
        {
          test: /locales/,
          loader: '@alienfast/i18next-loader',
          options: {
            basenameAsNamespace: true,
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
          exclude: [helpers.root('resource/styles/scss')]
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          exclude: [helpers.root('resource/styles/scss')]
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
          use: 'file-loader',
        }
      ]
    },
    plugins: [

      new AssetsPlugin({
        path: helpers.root('public/js'),
        filename: 'webpack-assets.json',
        prettyPrint: true,
      }),

      new CommonsChunkPlugin({
        name: 'commons',
        chunks: ['app', 'legacy', 'legacy-form', 'legacy-admin'],
        minChunks: module => /node_modules/.test(module.resource),
      }),
      new CommonsChunkPlugin({
        name: 'commons',
        chunks: ['commons', 'legacy-presentation'],
      }),
      new CommonsChunkPlugin({
        name: 'commons',
        chunks: ['commons', 'plugin'],
      }),

      // ignore
      new webpack.IgnorePlugin(/^\.\/lib\/deflate\.js/, /markdown-it-plantuml/),

      new webpack.ProvidePlugin({ // refs externals
        jQuery: 'jquery',
        $: 'jquery',
      }),

    ]
  };
};
