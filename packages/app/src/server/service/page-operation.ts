import { pagePathUtils } from '@growi/core';
import { addSeconds } from 'date-fns';

import PageOperation, { PageActionType, PageOperationDocument } from '~/server/models/page-operation';

import { ObjectIdLike } from '../interfaces/mongoose-utils';

const { isEitherOfPathAreaOverlap, isPathAreaOverlap, isTrashPage } = pagePathUtils;
const TIME_TO_ADD_SEC = 10;
const AUTO_UPDATE_INTERVAL_SEC = 5;

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
    const types = [Duplicate, Delete, DeleteCompletely, Revert, NormalizeParent];
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

  isProcessable(pageOp: PageOperationDocument): boolean {
    const { unprocessableExpiryDate } = pageOp;
    return unprocessableExpiryDate == null || (unprocessableExpiryDate != null && new Date() > unprocessableExpiryDate);
  }

  /**
   * add TIME_TO_ADD_SEC to current time and update unprocessableExpiryDate with it
   */
  async extendExpiryDate(operationId: ObjectIdLike): Promise<void> {
    const date = addSeconds(new Date(), TIME_TO_ADD_SEC);
    await PageOperation.findByIdAndUpdate(operationId, { unprocessableExpiryDate: date });
  }

  /**
   * Set interval to update unprocessableExpiryDate every AUTO_UPDATE_INTERVAL_SEC seconds.
   * This is used to prevent the same page operation from being processed multiple times at once
   */
  autoUpdateExpiryDate(operationId: ObjectIdLike): NodeJS.Timeout {
    const timerObj = setInterval(async() => {
      await this.extendExpiryDate(operationId);
    }, AUTO_UPDATE_INTERVAL_SEC * 1000);
    return timerObj;
  }

  clearAutoUpdateInterval(timerObj: NodeJS.Timeout): void {
    clearInterval(timerObj);
  }

}

export default PageOperationService;
