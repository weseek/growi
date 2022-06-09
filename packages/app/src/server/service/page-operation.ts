import { pagePathUtils } from '@growi/core';

import { IPageOperationProcessInfo, IPageOperationProcessData } from '~/interfaces/page-operation';
import PageOperation, { PageActionType, PageActionStage, PageOperationDocument } from '~/server/models/page-operation';

import { ObjectIdLike } from '../interfaces/mongoose-utils';

const { isEitherOfPathAreaOverlap, isPathAreaOverlap, isTrashPage } = pagePathUtils;
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

  async onAfterInit():Promise<void> {
    await this.executeAllRenameOperationBySystem();
  }

  // サーバー起動時にDBに残っている actionType が Rename の PageOperation をすべて、createdAt の古いものから順番に実行
  async executeAllRenameOperationBySystem(): Promise<void> {
    const Page = this.crowi.model('Page');

    const pageOps = await PageOperation.find({ actionType: PageActionType.Rename, actionStage: PageActionStage.Sub }).sort({ createdAt: 1 });
    if (pageOps.length === 0) return;

    for await (const pageOp of pageOps) {
      const {
        page, toPath, options, user,
      } = pageOp;

      const renamedPage = await Page.findById(pageOp.page._id);

      // rename 実行
      await this.crowi.pageService.renameSubOperation(page, toPath, user, options, renamedPage, pageOp._id);
    }
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

  /**
   * Generate object that connects page id with processData of PageOperation.
   * The processData is a combination of actionType as a key and information on whether the action is processable as a value.
   */
  generateProcessInfo(pageOps: PageOperationDocument[]): IPageOperationProcessInfo {
    const processInfo: IPageOperationProcessInfo = {};

    pageOps.forEach((pageOp) => {
      const pageId = pageOp.page._id.toString();

      const actionType = pageOp.actionType;
      const isProcessable = pageOp.isProcessable();

      // processData for processInfo
      const processData: IPageOperationProcessData = { [actionType]: { isProcessable } };

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

  /**
   * Set interval to update unprocessableExpiryDate every AUTO_UPDATE_INTERVAL_SEC seconds.
   * This is used to prevent the same page operation from being processed multiple times at once
   */
  autoUpdateExpiryDate(operationId: ObjectIdLike): NodeJS.Timeout {
    // https://github.com/Microsoft/TypeScript/issues/30128#issuecomment-651877225
    const timerObj = global.setInterval(async() => {
      await PageOperation.extendExpiryDate(operationId);
    }, AUTO_UPDATE_INTERVAL_SEC * 1000);
    return timerObj;
  }

  clearAutoUpdateInterval(timerObj: NodeJS.Timeout): void {
    clearInterval(timerObj);
  }

}

export default PageOperationService;
