/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */
const webpack = require('webpack');
const helpers = require('../src/lib/util/helpers');


module.exports = {
  mode: 'development',
  entry: {
    dlls: [
      // Libraries
      'axios',
      'babel-polyfill',
      'browser-bunyan', 'bunyan-format',
      'codemirror', 'react-codemirror2',
      'clipboard',
      'date-fns',
      'diff2html',
      'debug',
      'entities',
      'i18next', 'i18next-browser-languagedetector',
      'jquery-slimscroll',
      'lodash', 'pako',
      'markdown-it', 'csv-to-markdown-table',
      'react', 'react-dom',
      'react-bootstrap', 'react-bootstrap-typeahead', 'react-i18next', 'react-dropzone',
      'socket.io-client',
      'toastr',
      'xss',
    ],
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
      name: 'growi_dlls',
    }),
  ],
};
