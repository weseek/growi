/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

/**
 * Webpack Plugins
 */
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const helpers = require('../src/lib/util/helpers');

/**
 * Webpack Constants
 */
const { ANALYZE } = process.env;

module.exports = require('./webpack.common')({
  mode: 'production',
  devtool: undefined,
  output: {
    filename: '[name].[chunkhash].bundle.js',
    chunkFilename: '[name].[chunkhash].chunk.js',
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: false,
              plugins: (loader) => {
                return [
                  require('autoprefixer')(),
                ];
              },
            },
          },
          'sass-loader',
        ],
        exclude: [helpers.root('src/client/js/legacy')],
      },
      {
        test: /\.(css|scss)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        include: [helpers.root('src/client/js/legacy')],
      },
    ],
  },
  plugins: [

    new MiniCssExtractPlugin({
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
      new TerserPlugin({}),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
});
