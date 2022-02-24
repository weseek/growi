import { pagePathUtils } from '@growi/core';

import PageOperation from '~/server/models/page-operation';

const { isOperatable } = pagePathUtils;

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

    return isOperatable(isRecursively, fromPathToOp, toPathToOp, toPaths);
  }

}

export default PageOperationService;
