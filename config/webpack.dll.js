/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */
const webpack = require('webpack');
const helpers = require('./helpers');


module.exports = {
  mode: 'development',
  entry: {
    dlls: [
      'browser-bunyan', 'bunyan-format',
      'axios',
      'bootstrap-select',
      'clipboard',
      'date-fns',
      'debug',
      'entities',
      'react', 'react-dom', 'react-bootstrap', 'react-bootstrap-typeahead', 'react-i18next',
      'codemirror', 'react-codemirror2', 'react-dropzone',
      'jquery-slimscroll',
      'markdown-it', 'csv-to-markdown-table',
      'diff2html',
      'lodash', 'pako',
      'i18next', 'i18next-browser-languagedetector',
      'socket.io-client',
      'toastr',
      'xss',
      'growi-pluginkit',
    ]
  },
  output: {
    path: helpers.root('public/dll'),
    filename: 'dll.js',
    library: 'growi_dlls',
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [helpers.root('src'), helpers.root('node_modules')],
  },
  plugins: [
    new webpack.DllPlugin({
      path: helpers.root('public/dll/manifest.json'),
      name: 'growi_dlls'
    })
  ]
};
