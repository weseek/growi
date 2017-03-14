var path = require('path');
var webpack = require('webpack');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

var ManifestPlugin = require('webpack-manifest-plugin');

var config = {
  entry: {
    app:          './resource/js/app.js',
    crowi:        './resource/js/crowi.js',
    presentation: './resource/js/crowi-presentation.js',
    form:         './resource/js/crowi-form.js',
    admin:        './resource/js/crowi-admin.js',
  },
  output: {
    path: path.join(__dirname + "/public/js"),
    filename: "[name].[hash].js"
  },
  resolve: {
    modules: [
      './node_modules', './resource/thirdparty-js',
    ],
  },
  module: {
    rules: [
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

config.plugins.push(new ManifestPlugin());

module.exports = config;
