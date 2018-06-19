/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');

/*
 * Webpack Plugins
 */
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/**
 * Webpack Constants
 */
const ANALYZE = process.env.ANALYZE;

module.exports = require('./webpack.common')({
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  entry: {
    'js/dev': './resource/js/dev',
  },
  resolve: {
    // TODO merge in webpack.common.js
    modules: [path.join(process.env.HOME, '.node_modules')],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { sourceMap: true } },
        ],
        include: [helpers.root('resource/styles/scss')]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
        include: [helpers.root('resource/styles/scss')]
      },
    ],
  },
  plugins: [

    new webpack.DllReferencePlugin({
      context: helpers.root('public/dll'),
      manifest: path.join(helpers.root('public/dll'), 'manifest.json')
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: ANALYZE ? 'server' : 'disabled',
    }),

    new webpack.HotModuleReplacementPlugin(),

  ],
  optimization: {},
  performance: {
    hints: false
  }

});
