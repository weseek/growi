import React, { FC } from 'react';

import { PaginateResult } from 'mongoose';
import { IInAppNotification } from '../../interfaces/in-app-notification';
import { InAppNotification } from './InAppNotification';

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

  const notificationClickHandler = async(notification: Notification) => {
    try {
      // await this.props.crowi.apiPost('/notification.open', { id: notification._id });
      // jump to target page
      // window.location.href = notification.target.path;
    }
    catch (err) {
      // logger.error(err);
    }
  };

  const RenderEmptyInAppNotification = (): JSX.Element => {
    return (
      // TODO: apply i18n by #78569
      <>You had no notifications, yet.</>
    );
  };

  const RenderInAppNotificationList = () => {
    if (notifications.length === 0) {
      return <RenderEmptyInAppNotification />;
    }
    const notificationList = notifications.map((notification: IInAppNotification) => {
      return (
        <div className="d-flex flex-row" key={notification._id}>
          <InAppNotification notification={notification} onClick={notificationClickHandler} />
        </div>
      );
    });
    return <>{notificationList}</>;
  };

  return <RenderInAppNotificationList />;
};


export default InAppNotificationList;
