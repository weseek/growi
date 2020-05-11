import { pathUtils } from 'growi-commons';

import PagePath from './PagePath';

/**
 * Linked Array Structured PagePath Model
 */
export default class LinkedPagePath {

  constructor(path, skipNormalize = false) {

    const pagePath = new PagePath(path, skipNormalize);

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

}
