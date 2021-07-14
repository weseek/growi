/**
 * templateChecker
 */

function checkTemplatePath(path) {
  if (path.match(/.*\/_{1,2}template$/)) {
    return true;
  }

  return false;
}

module.exports = checkTemplatePath;
