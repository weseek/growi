var path = require('path');
var webpack = require('webpack');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

var ManifestPlugin = require('webpack-manifest-plugin');

var config = {
  entry: {
    plugin: './resource/js/plugin.js',
  },
  output: {
    path: path.join(__dirname + "/public/js"),
    filename: "[name].[hash].js"
  },
  resolve: {
    modules: [
      './node_modules', './plugin/node_modules',
    ],
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
        }]
      }
    ]
  },
  plugins: []
};

if (process.env && process.env.NODE_ENV !== 'development') {
  config.plugins = [
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new UglifyJsPlugin({
      compress:{
        warnings: false
      }
    }),
  ];
}

config.plugins.push(new ManifestPlugin({
  fileName: 'manifest-plugin.json'
}));

module.exports = config;
