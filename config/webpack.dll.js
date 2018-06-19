/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */
const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');


module.exports = {
  mode: 'development',
  entry: {
    dlls: ['react', 'react-dom']
  },
  output: {
    path: helpers.root('public/dll'),
    filename: 'dll.js'
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [helpers.root('src'), helpers.root('node_modules')],
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(helpers.root('public/dll'), 'manifest.json'),
      name: '[name]_[hash]'
    })
  ]
};
