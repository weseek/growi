import type { IUser, IPage } from '@growi/core';

import { SupportedTargetModel } from '~/interfaces/activity';
import * as pageSerializers from '~/models/serializers/in-app-notification-snapshot/page';

const isIPage = (targetModel: string, target: IUser | IPage): target is IPage => {
  return targetModel === SupportedTargetModel.MODEL_PAGE;
};

export const generateSnapshot = (targetModel: string, target: IUser | IPage) => {

  let snapshot;

  if (isIPage(targetModel, target)) {
    snapshot = pageSerializers.stringifySnapshot(target);
  }

  return snapshot;
};
