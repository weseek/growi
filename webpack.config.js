var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    app: './resource/js/app.js',
  },
  output: {
    path: path.join(__dirname + "/public/js"),
    filename: "[name].js"
  },
  resolve: {
    modulesDirectories: [
      './node_modules',
    ],
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      jQuery: "jquery",
      $: "jquery",
      jquery: "jquery"
    })
  ]
};
