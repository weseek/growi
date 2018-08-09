/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

const path = require('path');
const webpack = require('webpack');
const helpers = require('../src/lib/util/helpers');

/*
 * Webpack Plugins
 */
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/**
 * Webpack Constants
 */
const ANALYZE = process.env.ANALYZE;

module.exports = require('./webpack.common')({
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  entry: {
    'js/dev': './src/client/js/dev',
  },
  resolve: {
    // TODO merge in webpack.common.js
    modules: [path.join(process.env.HOME, '.node_modules')],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
        include: [helpers.root('src/client/styles/scss')]
      },
      { // Dump CSS for HackMD
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            'css-loader',
            'sass-loader'
          ]
        }),
        include: [helpers.root('src/client/styles/hackmd')]
      },
    ],
  },
  plugins: [

    new ExtractTextPlugin({
      filename: '[name].bundle.css',
    }),

    new webpack.DllReferencePlugin({
      context: helpers.root(),
      manifest: require(helpers.root('public/dll', 'manifest.json')),
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: ANALYZE ? 'server' : 'disabled',
    }),

  ],
  optimization: {},
  performance: {
    hints: false
  }

});
