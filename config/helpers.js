/**
 * @author: @AngularClass
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

var path = require('path');

// Helper functions
var ROOT = path.resolve(__dirname, '..');

function hasProcessFlag(flag) {
  return process.argv.join('').indexOf(flag) > -1;
}

var root = path.join.bind(path, ROOT);

exports.hasProcessFlag = hasProcessFlag;
exports.root = root;
