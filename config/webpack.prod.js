/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

const helpers = require('./helpers');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev

/**
 * Webpack Plugins
 */
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/**
 * Webpack Constants
 */
const ANALYZE = process.env.ANALYZE;
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

module.exports = function (env) {
  return webpackMerge(commonConfig({ env: ENV }), {
    devtool: 'source-map',
    output: {
      path: helpers.root('public/js'),
      publicPath: '/js/',
      filename: '[name].[chunkhash].bundle.js',
      sourceMapFilename: '[name].[chunkhash].bundle.map',
      chunkFilename: '[id].[chunkhash].chunk.js'
    },
    module: {
      rules: [
      ]
    },
    plugins: [

      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(ENV),
        }
      }),

      new OptimizeJsPlugin({
        sourceMap: false
      }),

      new UglifyJsPlugin({
        // beautify: true, //debug
        // mangle: false, //debug
        // dead_code: false, //debug
        // unused: false, //debug
        // deadCode: false, //debug
        // compress: {
        //   screw_ie8: true,
        //   keep_fnames: true,
        //   drop_debugger: false,
        //   dead_code: false,
        //   unused: false
        // }, // debug
        // comments: true, //debug


        beautify: false, //prod
        output: {
          comments: false
        }, //prod
        mangle: {
          screw_ie8: true
        }, //prod
        compress: {
          screw_ie8: true,
          warnings: false,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
          negate_iife: false // we need this for lazy v8
        },
      }),

      new BundleAnalyzerPlugin({
        analyzerMode: ANALYZE ? 'static' : 'disabled',
        reportFilename: helpers.root('report/bundle-analyzer.html'),
        openAnalyzer: false,
      }),

    ],

  });
}
