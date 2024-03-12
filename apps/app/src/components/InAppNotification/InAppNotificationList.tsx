import type { FC } from 'react';
import React from 'react';

import type { HasObjectId } from '@growi/core';

import type { IInAppNotification, PaginateResult } from '~/interfaces/in-app-notification';

import { LoadingSpinner } from '../LoadingSpinner';

import InAppNotificationElm from './InAppNotificationElm';


type Props = {
  inAppNotificationData?: PaginateResult<IInAppNotification>,
  onUnopenedNotificationOpend?: () => void,
};

const InAppNotificationList: FC<Props> = (props: Props) => {
  const { inAppNotificationData, onUnopenedNotificationOpend } = props;

  if (inAppNotificationData == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <LoadingSpinner className="me-1 fs-3" />
        </div>
      </div>
    );
  }

  const notifications = inAppNotificationData.docs;

  return (
    <div className="list-group">
      { notifications.map((notification: IInAppNotification & HasObjectId) => {
        return (
          <InAppNotificationElm
            key={notification._id}
            notification={notification}
            onUnopenedNotificationOpend={onUnopenedNotificationOpend}
          />
        );
      }) }
    </div>
  );
};


export default InAppNotificationList;
