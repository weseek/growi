import React, { FC, useImperativeHandle } from 'react';

import type { HasObjectId } from '@growi/core';
import { PagePathLabel } from '@growi/ui/dist/components';

import type { IInAppNotificationOpenable } from '~/client/interfaces/in-app-notification-openable';
import type { IInAppNotification } from '~/interfaces/in-app-notification';

import FormattedDistanceDate from '../../FormattedDistanceDate';

type Props = {
  notification: IInAppNotification & HasObjectId
  actionMsg: string
  actionIcon: string
  actionUsers: string
  publishOpen:() => void
  ref: React.ForwardedRef<IInAppNotificationOpenable>
};

export const ModelNotification: FC<Props> = (props) => {
  const {
    notification, actionMsg, actionIcon, actionUsers, publishOpen, ref,
  } = props;

  useImperativeHandle(ref, () => ({
    open() {
      publishOpen();
    },
  }));

  return (
    <div className="p-2 overflow-hidden">
      <div className="text-truncate">
        <b>{actionUsers}</b> {actionMsg} <PagePathLabel path={notification.parsedSnapshot?.path ?? ''} />
      </div>
      <i className={`${actionIcon} me-2`} />
      <FormattedDistanceDate
        id={notification._id}
        date={notification.createdAt}
        isShowTooltip={false}
        differenceForAvoidingFormat={Number.POSITIVE_INFINITY}
      />
    </div>
  );
};
