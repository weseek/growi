/* eslint-disable */
/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

const path = require('path');

/**
  * Webpack Plugins
  */
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/**
  * Webpack Constants
  */
const { ANALYZE_BUNDLE_SIZE } = process.env;

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
              postcssOptions: {
                plugins: [
                  require('autoprefixer')(),
                ],
              },
            },
          },
          'sass-loader',
        ],
        exclude: [path.resolve(__dirname, '../src/client/legacy')],
      },
      {
        test: /\.(css|scss)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        include: [path.resolve(__dirname, '../src/client/legacy')],
      },
    ],
  },
  plugins: [

    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: ANALYZE_BUNDLE_SIZE ? 'static' : 'disabled',
      reportFilename: path.resolve(__dirname, '../report/bundle-analyzer.html'),
      openAnalyzer: false,
    }),

  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({}),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
});
