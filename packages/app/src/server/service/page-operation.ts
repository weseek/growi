import { pagePathUtils, pathUtils } from '@growi/core';
import escapeStringRegexp from 'escape-string-regexp';

import PageOperation from '~/server/models/page-operation';

const { addTrailingSlash } = pathUtils;
const { isTrashPage } = pagePathUtils;

class PageOperationService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;

    // TODO: Remove this code when resuming feature is implemented
    PageOperation.deleteMany();
  }

  /**
   * Check if the operation is operatable by comparing paths with all Main PageOperation documents
   * @param fromPath The path to operate from
   * @param toPath The path to operate to
   * @param actionType The action type of the operation
   * @returns Promise<boolean>
   */
  async canOperate(isRecursively: boolean, fromPathToOp: string | null, toPathToOp: string | null): Promise<boolean> {
    const mainOps = await PageOperation.findMainOps();

    if (mainOps.length === 0) {
      return true;
    }

    const toPaths = mainOps.map(op => op.toPath).filter((p): p is string => p != null);

    if (isRecursively) {

      if (fromPathToOp != null && !isTrashPage(fromPathToOp)) {
        const flag = toPaths.some(p => this.isEitherOfPathAreaOverlap(p, fromPathToOp));
        if (flag) return false;
      }

      if (toPathToOp != null && !isTrashPage(toPathToOp)) {
        const flag = toPaths.some(p => this.isPathAreaOverlap(p, toPathToOp));
        if (flag) return false;
      }

    }
    else {

      if (fromPathToOp != null && !isTrashPage(fromPathToOp)) {
        const flag = toPaths.some(p => this.isPathAreaOverlap(p, fromPathToOp));
        if (flag) return false;
      }

      if (toPathToOp != null && !isTrashPage(toPathToOp)) {
        const flag = toPaths.some(p => this.isPathAreaOverlap(p, toPathToOp));
        if (flag) return false;
      }

    }

    return true;
  }

  private isEitherOfPathAreaOverlap(path1: string, path2: string): boolean {
    if (path1 === path2) {
      return true;
    }

    const path1WithSlash = addTrailingSlash(path1);
    const path2WithSlash = addTrailingSlash(path2);

    const path1Area = new RegExp(`^${escapeStringRegexp(path1WithSlash)}`);
    const path2Area = new RegExp(`^${escapeStringRegexp(path2WithSlash)}`);

    if (path1Area.test(path2) || path2Area.test(path1)) {
      return true;
    }

    return false;
  }

  private isPathAreaOverlap(pathToTest: string, pathToBeTested: string): boolean {
    if (pathToTest === pathToBeTested) {
      return true;
    }

    const pathWithSlash = addTrailingSlash(pathToTest);

    const pathAreaToTest = new RegExp(`^${escapeStringRegexp(pathWithSlash)}`);
    if (pathAreaToTest.test(pathToBeTested)) {
      return true;
    }

    return false;
  }

}

export default PageOperationService;
