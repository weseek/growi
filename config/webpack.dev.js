/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

const webpack = require('webpack');
const helpers = require('./helpers');
const webpackMerge = require('webpack-merge');
const webpackMergeDll = webpackMerge.strategy({plugins: 'replace'});
const commonConfig = require('./webpack.common.js');

/*
 * Webpack Plugins
 */
// problem with copy-webpack-plugin
const AssetsPlugin = require('assets-webpack-plugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DllBundlesPlugin = require('webpack-dll-bundles-plugin').DllBundlesPlugin;
const LiveReloadPlugin = require('webpack-livereload-plugin');

/*
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const WATCH = helpers.hasProcessFlag('watch');

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function (options) {
  return webpackMerge(commonConfig({ env: ENV }), {
    devtool: 'cheap-module-source-map',
    entry: {
      // dev: WATCH ?
      //   ['./resource/js/dev', 'reload/lib/reload-client']:
      //   ['./resource/js/dev'],
      dev: './resource/js/dev',
    },
    output: {
      path: helpers.root('public/js'),
      publicPath: '/js/',
      filename: '[name].bundle.js',
      sourceMapFilename: '[file].map',
    },
    resolve: {
      extensions: ['.js', '.json'],
      modules: [helpers.root('src'), helpers.root('node_modules')],
    },
    module: {
      rules: [
      ],
    },
    plugins: [

      new DllBundlesPlugin({
        bundles: {
          vendor: [
            'react',
            'react-dom',
            'jquery',
            'jquery.cookie',
          ],
        },
        dllDir: helpers.root('public/js/dll'),
        webpackConfig: webpackMergeDll(commonConfig({env: ENV}), {
          devtool: 'cheap-module-source-map',
          plugins: [],
        })
      }),

      new LiveReloadPlugin(),

      new webpack.NoEmitOnErrorsPlugin(),

    ]
  });
}
