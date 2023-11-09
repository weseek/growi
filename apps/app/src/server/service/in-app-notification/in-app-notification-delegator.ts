import type { IUser, Ref } from '@growi/core';

import { SupportedTargetModel } from '~/interfaces/activity';
import { ActivityDocument } from '~/server/models/activity';

import { PageNotificationDelegator } from './page-notification';
import { UserNotificationDelegator } from './user-notification';

export const getDelegator = (
    targetModel: string,
): PageNotificationDelegator | UserNotificationDelegator => {
  let delegator;

  switch (targetModel) {
    case SupportedTargetModel.MODEL_USER:
      delegator = new UserNotificationDelegator();
      break;
    case SupportedTargetModel.MODEL_PAGE:
      delegator = new PageNotificationDelegator();
      break;
  }

  return delegator;
};
