import React from 'react';

import { isPopulated, type HasObjectId } from '@growi/core';

import type { IPageBulkExportJobHasId } from '~/features/page-bulk-export/interfaces/page-bulk-export';
import { SupportedTargetModel } from '~/interfaces/activity';
import type { IInAppNotification } from '~/interfaces/in-app-notification';
import * as pageBulkExportJobSerializers from '~/models/serializers/in-app-notification-snapshot/page-bulk-export-job';

import { ModelNotification } from './ModelNotification';
import { useActionMsgAndIconForModelNotification } from './useActionAndMsg';

import type { ModelNotificationUtils } from '.';


export const usePageBulkExportJobModelNotification = (notification: IInAppNotification & HasObjectId): ModelNotificationUtils | null => {

  const { actionMsg, actionIcon } = useActionMsgAndIconForModelNotification(notification);

  const isPageBulkExportJobModelNotification = (
      notification: IInAppNotification & HasObjectId,
  ): notification is IInAppNotification<IPageBulkExportJobHasId> & HasObjectId => {
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

  const clickLink = notification.target?.attachment != null && isPopulated(notification.target?.attachment)
    ? notification.target.attachment.downloadPathProxied : undefined;

  return {
    Notification,
    clickLink,
    isDisabled: notification.target == null,
  };

};
