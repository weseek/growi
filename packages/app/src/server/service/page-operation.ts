import { pagePathUtils } from '@growi/core';

import PageOperation, { PageActionType, PageOperationDocument } from '~/server/models/page-operation';

const { isEitherOfPathAreaOverlap, isPathAreaOverlap, isTrashPage } = pagePathUtils;

type ProcessInfo = {
  [pageId: string]: {
    PageActionType: {
      isProcessing: boolean
    }
  }
}

class PageOperationService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

  // TODO: Remove this code when resuming feature is implemented
  async init() {
    const {
      Duplicate, Delete, DeleteCompletely, Revert, NormalizeParent,
    } = PageActionType;
    const types = [Duplicate, DeleteCompletely, Revert, NormalizeParent];
    await PageOperation.deleteByActionTypes(types);
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
      if (fromPathToOp != null && !isTrashPage(fromPathToOp)) {
        const fromFlag = fromPaths.some(p => isEitherOfPathAreaOverlap(p, fromPathToOp));
        if (fromFlag) return false;

        const toFlag = toPaths.some(p => isEitherOfPathAreaOverlap(p, fromPathToOp));
        if (toFlag) return false;
      }

      if (toPathToOp != null && !isTrashPage(toPathToOp)) {
        const fromFlag = fromPaths.some(p => isPathAreaOverlap(p, toPathToOp));
        if (fromFlag) return false;

        const toFlag = toPaths.some(p => isPathAreaOverlap(p, toPathToOp));
        if (toFlag) return false;
      }

    }
    else {
      if (fromPathToOp != null && !isTrashPage(fromPathToOp)) {
        const fromFlag = fromPaths.some(p => isPathAreaOverlap(p, fromPathToOp));
        if (fromFlag) return false;

        const toFlag = toPaths.some(p => isPathAreaOverlap(p, fromPathToOp));
        if (toFlag) return false;
      }

      if (toPathToOp != null && !isTrashPage(toPathToOp)) {
        const fromFlag = fromPaths.some(p => isPathAreaOverlap(p, toPathToOp));
        if (fromFlag) return false;

        const toFlag = toPaths.some(p => isPathAreaOverlap(p, toPathToOp));
        if (toFlag) return false;
      }
    }

    return true;
  }

  async generateProcessInfoByActionTypes(pageOps: PageOperationDocument[]): Promise<ProcessInfo> {
    const processInfo = {};

    pageOps.forEach((pageOp) => {
      const pageId = pageOp.page._id.toString();

      const actionType = pageOp.actionType;
      const isProcessing = true; // Todo: dynamically change the value based on PageOperation prop

      // processData for processInfo
      const processData = { [actionType]: { isProcessing } };

      // Merge processData if other processData exist
      if (processInfo[pageId] != null) {
        const otherProcessData = processInfo[pageId];
        processInfo[pageId] = { ...otherProcessData, ...processData };
        return;
      }
      // add new process data to processInfo
      processInfo[pageId] = processData;
    });

    return processInfo;
  }

}

export default PageOperationService;
