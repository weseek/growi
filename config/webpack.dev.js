/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

const webpack = require('webpack');
const helpers = require('../src/lib/util/helpers');

/*
 * Webpack Plugins
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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
    modules: ['../node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
        exclude: [
          helpers.root('src/client/styles/hackmd'),
          helpers.root('src/client/styles/scss/style-presentation.scss'),
        ]
      },
      { // Dump CSS for HackMD
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
        include: [
          helpers.root('src/client/styles/hackmd'),
          helpers.root('src/client/styles/scss/style-presentation.scss'),
        ]
      },
    ],
  },
  plugins: [

    new MiniCssExtractPlugin({
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
