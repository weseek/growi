import type { FC } from 'react';

import type { HasObjectId } from '@growi/core';

import type { IInAppNotification } from '~/interfaces/in-app-notification';


import { usePageBulkExportJobModelNotification } from './PageBulkExportJobModelNotification';
import { usePageModelNotification } from './PageModelNotification';
import { useUserModelNotification } from './UserModelNotification';

export interface ModelNotificationUtils {
  Notification: FC
  publishOpen?: () => void
  clickLink?: string
}

export const useModelNotification = (notification: IInAppNotification & HasObjectId): ModelNotificationUtils | null => {

  const pageModelNotificationUtils = usePageModelNotification(notification);
  const userModelNotificationUtils = useUserModelNotification(notification);
  const pageBulkExportResultModelNotificationUtils = usePageBulkExportJobModelNotification(notification);

  const modelNotificationUtils = pageModelNotificationUtils ?? userModelNotificationUtils ?? pageBulkExportResultModelNotificationUtils;


  return modelNotificationUtils;
};
