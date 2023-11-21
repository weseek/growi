import type { IUser, IPage } from '@growi/core';

import { SupportedTargetModel } from '~/interfaces/activity';
import * as pageSerializers from '~/models/serializers/in-app-notification-snapshot/page';

export const generateSnapshot = (targetModel: string, target: IUser | IPage) => {

  let snapshot;

  switch (targetModel) {
    case SupportedTargetModel.MODEL_PAGE:
      snapshot = pageSerializers.stringifySnapshot(target as IPage);
      break;
    default:
      break;
  }

  return snapshot;
};
