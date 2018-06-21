/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */
const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');


module.exports = {
  mode: 'development',
  entry: {
    dlls: [
      'react', 'react-dom', 'react-bootstrap', 'react-bootstrap-typeahead', 'react-i18next',
      'codemirror', 'react-codemirror2', 'react-dropzone',
      'jquery-slimscroll', 'jquery-ui',
      'markdown-it',
      'diff2html', 'lodash', 'i18next',
    ]
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
