/* eslint-disable */
/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */
const path = require('path');
const webpack = require('webpack');


module.exports = {
  mode: 'development',
  entry: {
    dlls: [
      // Libraries
      'axios',
      'browser-bunyan', 'bunyan-format',
      'codemirror', 'react-codemirror2',
      'date-fns',
      'diff2html',
      'debug',
      'entities',
      'i18next', 'i18next-browser-languagedetector',
      'jquery-slimscroll',
      'lodash', 'pako',
      'markdown-it', 'csv-to-markdown-table',
      'react', 'react-dom',
      'reactstrap', 'react-bootstrap-typeahead',
      'react-i18next', 'react-dropzone', 'react-hotkeys', 'react-copy-to-clipboard', 'react-waypoint',
      'socket.io-client',
      'toastr',
      'unstated',
      'xss',
    ],
  },
  output: {
    path: path.resolve(__dirname, '../public/dll'),
    filename: 'dll.js',
    library: 'growi_dlls',
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [path.resolve(__dirname, '../src'), path.resolve(__dirname, '../node_modules')],
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, '../public/dll/manifest.json'),
      name: 'growi_dlls',
    }),
  ],
};
