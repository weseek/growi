import { pagePathUtils } from '@growi/core';
import { FilterQuery, QueryOptions } from 'mongoose';

import PageOperation, { PageActionType, PageOperationDocument } from '~/server/models/page-operation';

import { PageDocument } from '../models/page';


const { isEitherOfPathAreaOverlap, isPathAreaOverlap, isTrashPage } = pagePathUtils;

type ParentId = string;
type RenameSubOperationInfo = {
  parentId: string,
  targtPageId: string,
  isProcessing: boolean,
}

type RenameSubOperationInfoMap = Map<ParentId, RenameSubOperationInfo[]>;

class PageOperationService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
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

  /**
   * check if the page operation is currently being processed
   */
  isProcessingPageOperation(pageOperation: PageOperationDocument): boolean {
    const expiryDate = pageOperation.unprocessableExpiryDate;
    return expiryDate != null && new Date() < expiryDate;
  }

  /**
   * return Map data that are something like this
   * {
   *    'parentPageIdA': [
   *       {pageOpId: '001', targtPageId: 'xxx', isProcessing: true},
   *       {pageOpId: '002', targtPageId: 'xxx', isProcessing: true}
   *    ],
   *    'parentPageIdB': [
   *       {pageOpId: '003', targtPageId: 'yyy', isProcessing: false}
   *    ]
   * }
   */
  async getRenameSubOpInfoMap(
      filter?: FilterQuery<PageOperationDocument>, projection?: any, options?: QueryOptions,
  ): Promise<RenameSubOperationInfoMap> {

    const renamePageSubOps = await PageOperation.findSubOps(filter, projection, options); // asc

    const parentIdToPageOpsInfo = new Map();

    for (const op of renamePageSubOps) {
      if (op.page.parent == null) {
        continue;
      }
      const parentId = op.page.parent.toString(); // key for the map
      const targetPageId = op.page._id;
      const isProcessing = this.isProcessingPageOperation(op);

      const pageOpInfo = {
        targetPageId, isProcessing, parentId,
      };

      // replace existing data with new data including new info if the key already exists
      if (parentIdToPageOpsInfo.has(parentId)) {
        const oldValue = parentIdToPageOpsInfo.get(parentId);
        const newValue = [...oldValue, pageOpInfo];
        // replace
        parentIdToPageOpsInfo.set(parentId, newValue);
        continue;
      }
      // set new data if the key does not exist
      parentIdToPageOpsInfo.set(parentId, [pageOpInfo]); // value should be array because it's possible that multiple data with same key exist
    }
    return parentIdToPageOpsInfo;
  }

  /**
   * add RenameOperationInfo to page documents as a new property
   */
  addShouldResumeRenameOpInfoToPages(pages: PageDocument[], renameSubOpsInfoMap: RenameSubOperationInfoMap): PageDocument[] {
    const newPages = [...pages]; // copy

    renameSubOpsInfoMap.forEach((value, parentId) => {
      for (const page of newPages) {
        const pageId = page._id.toString();

        if (pageId === parentId) {
          page.renameOperationInfo = value;
          continue;
        }
      }
    });

    return newPages;
  }

  /**
   * add RenameOperationInfo to root page document as a new property
   */
  async addShouldResumeRenameOpInfoToRootPage(rootPage) {
    const filter = { actionType: PageActionType.Rename, path: '/' }; // exclude root page
    const renameSubOpsInfoMap = await this.getRenameSubOpInfoMap(filter);
    const pages = await this.addShouldResumeRenameOpInfoToPages([rootPage], renameSubOpsInfoMap);

    const modifiedRootPage = pages[0];
    return modifiedRootPage;
  }

}

export default PageOperationService;
