const { pathUtils } = require('growi-commons');
const { isTrashPage } = require('~/utils/path-utils');

const DevidedPagePath = require('./devided-page-path');

/**
 * Linked Array Structured PagePath Model
 */
class LinkedPagePath {

  constructor(path, skipNormalize = false) {

    const pagePath = new DevidedPagePath(path, skipNormalize);

    this.path = path;
    this.pathName = pagePath.latter;
    this.isRoot = pagePath.isRoot;
    this.parent = pagePath.isRoot
      ? null
      : new LinkedPagePath(pagePath.former, true);

  }

  get href() {
    if (this.isRoot) {
      return '';
    }

    return pathUtils.normalizePath(`${this.parent.href}/${this.pathName}`);
  }

  get isInTrash() {
    return isTrashPage(this.path);
  }

}

module.exports = LinkedPagePath;
