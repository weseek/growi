import { pagePathUtils } from '@growi/core';

import { PageDocument } from '~/server/models/page';
import PageOperation, { PageActionType } from '~/server/models/page-operation';

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
    const mainOps = await PageOperation.findMainOps();

    if (mainOps.length === 0) {
      return true;
    }

    const toPaths = mainOps.map(op => op.toPath).filter((p): p is string => p != null);

    if (isRecursively) {

      if (fromPathToOp != null && !isTrashPage(fromPathToOp)) {
        const flag = toPaths.some(p => isEitherOfPathAreaOverlap(p, fromPathToOp));
        if (flag) return false;
      }

      if (toPathToOp != null && !isTrashPage(toPathToOp)) {
        const flag = toPaths.some(p => isPathAreaOverlap(p, toPathToOp));
        if (flag) return false;
      }

    }
    else {

      if (fromPathToOp != null && !isTrashPage(fromPathToOp)) {
        const flag = toPaths.some(p => isPathAreaOverlap(p, fromPathToOp));
        if (flag) return false;
      }

      if (toPathToOp != null && !isTrashPage(toPathToOp)) {
        const flag = toPaths.some(p => isPathAreaOverlap(p, toPathToOp));
        if (flag) return false;
      }

    }

    return true;
  }

  async injectShouldFixPath(pages: any) {
    const filter = { actionType: PageActionType.Rename };
    const pageOperations = await PageOperation.find(filter);

    const _pageOperationIds = pageOperations.map(op => op.page._id.toString());
    const pageOperationIds = Array.from(new Set(_pageOperationIds)); // remove duplicate ids

    for (const pageOperationId of pageOperationIds) {
      for (const page of pages) {
        const pageId = page._id.toString();
        if (pageOperationId === pageId) {
          page.shouldFixPath = true;
        }
      }
    }

  }

}

export default PageOperationService;
