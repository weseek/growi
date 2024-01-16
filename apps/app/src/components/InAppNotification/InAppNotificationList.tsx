import React, { FC } from 'react';

import type { HasObjectId } from '@growi/core';

import type { IInAppNotification, PaginateResult } from '~/interfaces/in-app-notification';

import InAppNotificationElm from './InAppNotificationElm';


type Props = {
  inAppNotificationData?: PaginateResult<IInAppNotification>,
  onClickNotificationElm?: () => void,
};

const InAppNotificationList: FC<Props> = (props: Props) => {
  const { inAppNotificationData, onClickNotificationElm } = props;

  if (inAppNotificationData == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse me-1"></i>
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
            onClick={onClickNotificationElm}
          />
        );
      }) }
    </div>
  );
};


export default InAppNotificationList;
