import React, { FC } from 'react';

import { PaginateResult } from 'mongoose';
import { IInAppNotification } from '../../interfaces/in-app-notification';
import InAppNotificationElm from './InAppNotificationElm';

type Props = {
  inAppNotificationData: PaginateResult<IInAppNotification> | undefined;
};

const InAppNotificationList: FC<Props> = (props: Props) => {
  const { inAppNotificationData } = props;

  if (inAppNotificationData == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  const notifications = inAppNotificationData.docs;

  const InAppNotificationList = () => {
    return (
      <>
        {notifications.map((notification: IInAppNotification) => {
          return (
            <div className="d-flex flex-row" key={notification._id}>
              <InAppNotificationElm notification={notification} />
            </div>
          );
        })}
      </>
    );
  };

  return (
    <>
      {notifications.length === 0 ? <>You had no notifications, yet.</> : <InAppNotificationList />}
    </>
  );
};


export default InAppNotificationList;
