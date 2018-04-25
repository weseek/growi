/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');
const webpackMerge = require('webpack-merge');
const webpackMergeDll = webpackMerge.strategy({plugins: 'replace'});
const commonConfig = require('./webpack.common.js');

/*
 * Webpack Plugins
 */
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DllBundlesPlugin = require('webpack-dll-bundles-plugin').DllBundlesPlugin;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/*
 * Webpack Constants
 */
const ANALYZE = process.env.ANALYZE;
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function (options) {
  return webpackMerge(commonConfig({ env: ENV }), {
    devtool: 'source-map',
    entry: {
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
      modules: [helpers.root('src'), helpers.root('node_modules'), path.join(process.env.HOME, '.node_modules')],
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: 'style-loader', options: { sourceMap: true } },
            { loader: 'css-loader', options: { sourceMap: true } },
          ],
          include: [helpers.root('resource/styles/scss')]
        },
        {
          test: /\.scss$/,
          use: [
            { loader: 'style-loader', options: { sourceMap: true } },
            { loader: 'css-loader', options: { sourceMap: true } },
            { loader: 'sass-loader', options: { sourceMap: true } },
          ],
          include: [helpers.root('resource/styles/scss')]
        },
      ],
    },
    plugins: [

      new ExtractTextPlugin('[name].bundle.css'),

      new DllBundlesPlugin({
        bundles: {
          vendor: [
            'react',
            'react-dom'
          ],
        },
        dllDir: helpers.root('public/dll'),
        webpackConfig: webpackMergeDll(commonConfig({env: ENV}), {
          devtool: undefined,
          plugins: [],
        })
      }),

      new webpack.NoEmitOnErrorsPlugin(),

      new BundleAnalyzerPlugin({
        analyzerMode: ANALYZE ? 'server' : 'disabled',
      }),

    ]
  });
}
