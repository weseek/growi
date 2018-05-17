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
const DllBundlesPlugin = require('webpack-dll-bundles-plugin').DllBundlesPlugin;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/*
 * Webpack Constants
 */
const ANALYZE = process.env.ANALYZE;
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function(options) {
  return webpackMerge(commonConfig({ env: ENV }), {
    devtool: 'cheap-module-eval-source-map',
    entry: {
      dev: './resource/js/dev',
    },
    output: {
      path: helpers.root('public/js'),
      publicPath: '/js/',
      filename: '[name].bundle.js',
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

      new DllBundlesPlugin({
        bundles: {
          vendor: [
            'axios',
            'codemirror',
            'date-fns',
            'diff',
            'diff2html',
            'jquery-ui',
            'markdown-it',
            'metismenu',
            'react',
            'react-dom',
            'react-bootstrap',
            'react-bootstrap-typeahead',
            'react-dropzone',
            'socket.io-client',
            'toastr',
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
};
