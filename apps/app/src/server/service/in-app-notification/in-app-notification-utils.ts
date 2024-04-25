import type { IUser, IPage } from '@growi/core';

import type { IPageBulkExportJob } from '~/features/page-bulk-export/interfaces/page-bulk-export';
import { SupportedTargetModel } from '~/interfaces/activity';
import * as pageSerializers from '~/models/serializers/in-app-notification-snapshot/page';

const isIPage = (targetModel: string, target: IUser | IPage | IPageBulkExportJob): target is IPage => {
  return targetModel === SupportedTargetModel.MODEL_PAGE;
};

export const generateSnapshot = (targetModel: string, target: IUser | IPage | IPageBulkExportJob): string | undefined => {

  let snapshot: string | undefined;

  if (isIPage(targetModel, target)) {
    snapshot = pageSerializers.stringifySnapshot(target);
  }

  return snapshot;
};
