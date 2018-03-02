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
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');;

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
      'style-presentation':   './resource/styles/presentation',
    },
    externals: {
      // require("jquery") is external and available
      //  on the global var jQuery
      "jquery": "jQuery",
      "emojione": "emojione",
      "hljs": "hljs",
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
            options: {
              plugins: ['lodash'],
            }
          }]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
          // comment out 'include' spec for crowi-plugins
          // include: [helpers.root('resource')]
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          // comment out 'include' spec for crowi-plugins
          // include: [helpers.root('resource')]
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

      new LodashModuleReplacementPlugin,

      // ignore
      new webpack.IgnorePlugin(/^\.\/lib\/deflate\.js/, /markdown-it-plantuml/),

      new webpack.ProvidePlugin({ // refs externals
        jQuery: "jquery",
        $: "jquery",
      }),

    ]
  };
}
