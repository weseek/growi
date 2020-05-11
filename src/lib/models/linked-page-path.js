import { pathUtils } from 'growi-commons';

import DevidedPagePath from './devided-page-path';

/**
 * Linked Array Structured PagePath Model
 */
export default class LinkedPagePath {

  constructor(path, skipNormalize = false) {

    const pagePath = new DevidedPagePath(path, skipNormalize);

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
