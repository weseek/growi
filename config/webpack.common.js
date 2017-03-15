const webpack = require('webpack');
const helpers = require('./helpers');

/*
 * Webpack Plugins
 */
// problem with copy-webpack-plugin
const AssetsPlugin = require('assets-webpack-plugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

/*
 * Webpack Constants
 */
const HMR = helpers.hasProcessFlag('hot');

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function (options) {
  isProd = options.env === 'production';
  return {
    entry: {
      'app':                  './resource/js/app',
      'legacy':               './resource/js/legacy/crowi',
      'legacy-form':          './resource/js/legacy/crowi-form',
      'legacy-admin':         './resource/js/legacy/crowi-admin',
      'legacy-presentation':  './resource/js/legacy/crowi-presentation',
      'plugin':               './resource/js/plugin',
      'style':                './resource/styles',
    },
    resolve: {
      extensions: ['.js', '.json'],
      modules: [helpers.root('src'), helpers.root('node_modules')],
    },
    module: {
      rules: [
        {
          test: /.jsx?$/,
          exclude: /node_modules/,
          use: [{
            loader: 'babel-loader?cacheDirectory',
          }]
        },
        {
          test: /\.json$/,
          use: 'json-loader',
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
          test: /\.(eot|woff2?|svg|ttf)([\?]?.*)$/,
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
        minChunks: module => /node_modules/.test(module.resource),
      }),

      new webpack.ProvidePlugin({
        jQuery: "jquery",
        $: "jquery",
      }),

    ]
  };
}
