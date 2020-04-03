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
      'browser-bunyan', 'bunyan-format',
      'codemirror', 'react-codemirror2',
      'date-fns',
      'diff2html',
      'debug',
      'entities',
      'growi-commons',
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
