var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    app: './resource/js/app.js',
    crowi: './resource/js/crowi.js',
    presentation: './resource/js/crowi-presentation.js',
    form: './resource/js/crowi-form.js',
    admin: './resource/js/crowi-admin.js',
  },
  output: {
    path: path.join(__dirname + "/public/js"),
    filename: "[name].js"
  },
  resolve: {
    modulesDirectories: [
      './node_modules', './resource/thirdparty-js',
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
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    })
    //new webpack.ProvidePlugin({
    //  jQuery: "jquery",
    //  $: "jquery",
    //  jqeury: "jquery",
    //}),
    //new webpack.optimize.DedupePlugin(),
  ]
};
