import type { HasObjectId } from '@growi/core';

import type { IInAppNotification } from '~/interfaces/in-app-notification';


import { usePageModelNotification, type ModelNotificationUtils } from './PageModelNotification';
import { useUserModelNotification } from './UserModelNotification';


export const useModelNotification = (notification: IInAppNotification & HasObjectId): ModelNotificationUtils | null => {

  const pageModelNotificationUtils = usePageModelNotification(notification);
  const userModelNotificationUtils = useUserModelNotification(notification);

  const modelNotificationUtils = pageModelNotificationUtils ?? userModelNotificationUtils;


  return modelNotificationUtils;
};
