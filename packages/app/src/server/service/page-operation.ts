import { pagePathUtils } from '@growi/core';

import PageOperation from '~/server/models/page-operation';

const { isEitherOfPathAreaOverlap, isPathAreaOverlap, isTrashPage } = pagePathUtils;

class PageOperationService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

  // TODO: Remove this code when resuming feature is implemented
  async init():Promise<void> {
    await PageOperation.deleteMany({});
  }

  /**
   * Check if the operation is operatable
   * @param isRecursively Boolean that determines whether the operation is recursive or not
   * @param fromPathToOp The path to operate from
   * @param toPathToOp The path to operate to
   * @returns boolean
   */
  async canOperate(isRecursively: boolean, fromPathToOp: string | null, toPathToOp: string | null): Promise<boolean> {
    const pageOperations = await PageOperation.find();

    if (pageOperations.length === 0) {
      return true;
    }

    const fromPaths = pageOperations.map(op => op.fromPath).filter((p): p is string => p != null);
    const toPaths = pageOperations.map(op => op.toPath).filter((p): p is string => p != null);

    if (isRecursively) {
      // fromPaths
      if (fromPathToOp != null && !isTrashPage(fromPathToOp)) {
        const flag = fromPaths.some(p => isEitherOfPathAreaOverlap(p, fromPathToOp));
        if (flag) return false;
      }
      // toPaths
      if (fromPathToOp != null && !isTrashPage(fromPathToOp)) {
        const flag = toPaths.some(p => isEitherOfPathAreaOverlap(p, fromPathToOp));
        if (flag) return false;
      }

      // fromPaths
      if (toPathToOp != null && !isTrashPage(toPathToOp)) {
        const flag = fromPaths.some(p => isPathAreaOverlap(p, toPathToOp));
        if (flag) return false;
      }
      // toPaths
      if (toPathToOp != null && !isTrashPage(toPathToOp)) {
        const flag = toPaths.some(p => isPathAreaOverlap(p, toPathToOp));
        if (flag) return false;
      }

    }
    else {
      // fromPaths
      if (fromPathToOp != null && !isTrashPage(fromPathToOp)) {
        const flag = fromPaths.some(p => isPathAreaOverlap(p, fromPathToOp));
        if (flag) return false;
      }
      // toPaths
      if (fromPathToOp != null && !isTrashPage(fromPathToOp)) {
        const flag = toPaths.some(p => isPathAreaOverlap(p, fromPathToOp));
        if (flag) return false;
      }

      // fromPaths
      if (toPathToOp != null && !isTrashPage(toPathToOp)) {
        const flag = fromPaths.some(p => isPathAreaOverlap(p, toPathToOp));
        if (flag) return false;
      }
      // toPaths
      if (toPathToOp != null && !isTrashPage(toPathToOp)) {
        const flag = toPaths.some(p => isPathAreaOverlap(p, toPathToOp));
        if (flag) return false;
      }
    }

    return true;
  }

}

export default PageOperationService;
