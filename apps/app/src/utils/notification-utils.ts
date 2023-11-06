import type { IUser, IPage } from '@growi/core';

import { SupportedTargetModel } from '~/interfaces/activity';
import { IInAppNotification } from '~/interfaces/in-app-notification';


export const isPageNotification = (notification: IInAppNotification<IUser | IPage>): notification is IInAppNotification<IPage> => {
  return notification.targetModel === SupportedTargetModel.MODEL_PAGE;
};

export const isUserNotification = (notification: IInAppNotification<IUser | IPage>): notification is IInAppNotification<IUser> => {
  return notification.targetModel === SupportedTargetModel.MODEL_USER;
};
