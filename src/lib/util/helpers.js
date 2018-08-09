/**
 * @author: @AngularClass
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

const path = require('path');

// Helper functions
const ROOT = path.resolve(__dirname, '../../..');

function hasProcessFlag(flag) {
  return process.argv.join('').indexOf(flag) > -1;
}

const root = path.join.bind(path, ROOT);

exports.hasProcessFlag = hasProcessFlag;
exports.root = root;
