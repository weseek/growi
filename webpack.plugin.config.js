var path = require('path');
var webpack = require('webpack');

var ManifestPlugin = require('webpack-manifest-plugin');

var config = {
  entry: {
    plugin: './plugin/plugin.js',
  },
  output: {
    path: path.join(__dirname + "/public/js"),
    filename: "[name].[hash].js"
  },
  resolve: {
    modulesDirectories: [
      './node_modules', './plugin/node_modules',
    ],
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
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
    new webpack.optimize.UglifyJsPlugin({
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
