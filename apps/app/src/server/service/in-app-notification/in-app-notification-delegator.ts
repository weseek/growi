import type { IUser, Ref } from '@growi/core';

import { SupportedTargetModel } from '~/interfaces/activity';
import { ActivityDocument } from '~/server/models/activity';

import { PageNotificationDelegator } from './page-notification';
import { UserNotificationDelegator } from './user-notification';

export const getDelegator = (
    targetModel: string, activity: ActivityDocument, target, users: Ref<IUser>[], socketIoService, commentService,
): PageNotificationDelegator | UserNotificationDelegator => {
  let delegator;

  switch (targetModel) {
    case SupportedTargetModel.MODEL_USER:
      delegator = new UserNotificationDelegator(activity, target, users, socketIoService);
      break;
    case SupportedTargetModel.MODEL_PAGE:
      delegator = new PageNotificationDelegator(activity, target, users, socketIoService, commentService);
      break;
  }

  return delegator;
};
