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
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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
      'style':                './resource/styles/scss/style.scss',
      'style-theme-default':  './resource/styles/scss/theme/default.scss',
      'style-theme-default-dark':  './resource/styles/scss/theme/default-dark.scss',
      'style-presentation':   './resource/styles/scss/style-presentation.scss',
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
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              { loader: 'css-loader', options: {
                sourceMap: !isProd,
                minimize: isProd
              } },
              { loader: 'postcss-loader', options: {
                sourceMap: !isProd,
                plugins: (loader) => [
                  require('autoprefixer')()
                ]
              } },
              { loader: 'sass-loader', options: { sourceMap: !isProd } }
            ]
          }),
          include: [helpers.root('resource/styles/scss')]
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

      // ignore
      new webpack.IgnorePlugin(/^\.\/lib\/deflate\.js/, /markdown-it-plantuml/),

      new webpack.ProvidePlugin({ // refs externals
        jQuery: "jquery",
        $: "jquery",
      }),

    ]
  };
}
