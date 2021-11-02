import React, { FC } from 'react';

import { IInAppNotification } from '../../interfaces/in-app-notification';
import { InAppNotification } from './InAppNotification';

type Props = {
  notifications: Array<IInAppNotification>;
  isLoaded: boolean;
};

const InAppNotificationContents: FC<Props> = (props: Props) => {
  const { notifications } = props;

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

  const RenderUnLoadedInAppNotification = (): JSX.Element => {
    return (
      <i className="fa fa-spinner"></i>
    );
  };

  const RenderEmptyInAppNotification = (): JSX.Element => {
    return (
      // TODO: apply i18n by #78569
      <>You had no notifications, yet.</>
    );
  };

  const RenderInAppNotificationList = () => {
    console.log('notificationsHoge', notifications);


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


  if (!props.isLoaded) {
    return <RenderUnLoadedInAppNotification />;
  }
  return <RenderInAppNotificationList />;
};


export default InAppNotificationContents;
