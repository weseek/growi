import React from 'react';

import type { HasObjectId } from '@growi/core';
import { useRouter } from 'next/router';

import type { IPageBulkExportJob } from '~/features/page-bulk-export/interfaces/page-bulk-export';
import { SupportedTargetModel } from '~/interfaces/activity';
import type { IInAppNotification } from '~/interfaces/in-app-notification';
import * as pageBulkExportJobSerializers from '~/models/serializers/in-app-notification-snapshot/page-bulk-export-job';

import { ModelNotification } from './ModelNotification';
import type { ModelNotificationUtils } from './PageModelNotification';
import { useActionMsgAndIconForModelNotification } from './useActionAndMsg';


export const usePageBulkExportJobModelNotification = (notification: IInAppNotification & HasObjectId): ModelNotificationUtils | null => {

  const { actionMsg, actionIcon } = useActionMsgAndIconForModelNotification(notification);
  const router = useRouter();

  const isPageBulkExportJobModelNotification = (
      notification: IInAppNotification & HasObjectId,
  ): notification is IInAppNotification<IPageBulkExportJob> & HasObjectId => {
    return notification.targetModel === SupportedTargetModel.MODEL_PAGE_BULK_EXPORT_JOB;
  };

  if (!isPageBulkExportJobModelNotification(notification)) {
    return null;
  }

  const actionUsers = notification.user.username;

  notification.parsedSnapshot = pageBulkExportJobSerializers.parseSnapshot(notification.snapshot);

  const Notification = () => {
    return (
      <ModelNotification
        notification={notification}
        actionMsg={actionMsg}
        actionIcon={actionIcon}
        actionUsers={actionUsers}
      />
    );
  };

  const publishOpen = () => {
    router.push('/admin/users');
  };

  return {
    Notification,
    publishOpen,
  };

};
