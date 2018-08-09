/**
 * templateChecker
 */

module.exports = function(path) {
  'use strict';

  if (path.match(/.*\/_{1,2}template$/)) {
    return true;
  }

  return false;
};
