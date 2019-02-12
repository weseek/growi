/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */
const helpers = require('../src/lib/util/helpers');

/**
 * Webpack Plugins
 */
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/**
 * Webpack Constants
 */
const ANALYZE = process.env.ANALYZE;

module.exports = require('./webpack.common')({
  mode: 'production',
  devtool: undefined,
  output: {
    filename: '[name].[chunkhash].bundle.js',
    chunkFilename: '[name].[chunkhash].chunk.js'
  },
  module: {
    rules: [
      {
        test: /\.(sc|sa|c)ss$/,
        use: ExtractTextPlugin.extract({
          use: [
            'css-loader',
            { loader: 'postcss-loader', options: {
              sourceMap: false,
              plugins: (loader) => [
                require('autoprefixer')()
              ]
            } },
            'sass-loader'
          ]
        }),
        include: [helpers.root('src/client')]
      }
    ]
  },
  plugins: [

    new ExtractTextPlugin({
      filename: '[name].[hash].css',
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: ANALYZE ? 'static' : 'disabled',
      reportFilename: helpers.root('report/bundle-analyzer.html'),
      openAnalyzer: false,
    }),

  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
      }),
      new OptimizeCSSAssetsPlugin({})
    ],
  },
});
