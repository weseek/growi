import { pagePathUtils } from '@growi/core';

import PageOperation, { PageActionType } from '~/server/models/page-operation';

const { isTrashPage } = pagePathUtils;

class PageOperationService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;

    // TODO: Remove this code when resuming feature is implemented
    PageOperation.deleteMany();
  }

  /**
   * Check if the operation is operatable by comparing paths with all PageOperation documents
   * @param fromPath The path to operate from
   * @param toPath The path to operate to
   * @param actionType The action type of the operation
   * @returns Promise<boolean>
   */
  async canOperate(fromPath: string, toPath: string, actionType: PageActionType): Promise<boolean> {
    // 1. Block when toPath is already reserved by other toPath
    // 2. Block when toPath is already reserved by fromPath of "Delete" or "DeleteCompletely"
    if (toPath != null) {
      const isPageOpsExist = await PageOperation.exists({ toPath });
      const isToPathTrash = isTrashPage(toPath);
      const isForbidden1 = isPageOpsExist && !isToPathTrash;

      if (isForbidden1) {
        return false;
      }

      const pageOps = await PageOperation.findMainOps({ actionType: { $in: [PageActionType.Delete, PageActionType.DeleteCompletely] } });
      const fromPathsToBlock = pageOps.map(po => po.fromPath);
      const isForbidden2 = fromPathsToBlock.includes(toPath);

      if (isForbidden2) {
        return false;
      }
    }

    if (fromPath != null) {
      return true;
    }

    return true;
  }

}

export default PageOperationService;
