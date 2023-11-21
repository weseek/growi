import type { IUser, IPage, Ref } from '@growi/core';

import { SupportedTargetModel } from '~/interfaces/activity';
import { ActivityDocument } from '~/server/models/activity';

import { PageNotificationDelegator } from './page-notification';
import { UserNotificationDelegator } from './user-notification';

const isPageNotification = (targetModel: string, target: IUser | IPage): target is IPage => {
  return targetModel === SupportedTargetModel.MODEL_PAGE;
};

const isUserNotification = (targetModel: string, target: IUser | IPage): target is IUser => {
  return targetModel === SupportedTargetModel.MODEL_PAGE;
};

export const getDelegator = (
    targetModel: string, target: IUser | IPage,
): PageNotificationDelegator | UserNotificationDelegator => {
  let delegator;

  if (isPageNotification(targetModel, target)) {
    delegator = new PageNotificationDelegator(target);
  }
  else if (isUserNotification(targetModel, target)) {
    delegator = new UserNotificationDelegator();
  }

  return delegator;
};
