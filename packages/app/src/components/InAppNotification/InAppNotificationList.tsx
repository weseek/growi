import React, { FC } from 'react';

import { PaginateResult } from 'mongoose';
import { useTranslation } from 'react-i18next';
import { IInAppNotification } from '../../interfaces/in-app-notification';
import InAppNotificationElm from './InAppNotificationElm';


type Props = {
  inAppNotificationData: PaginateResult<IInAppNotification> | undefined;
};

const InAppNotificationList: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
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

  const renderInAppNotificationList = () => {
    const inAppNotificationList = notifications.map((notification: IInAppNotification) => {
      return (
        <div className="d-flex flex-row" key={notification._id}>
          <InAppNotificationElm notification={notification} />
        </div>
      );
    });

    return inAppNotificationList;
  };

  return (
    <>
      {notifications.length === 0 ? <>{t('in_app_notification.no_notification')}</> : renderInAppNotificationList()}
    </>
  );
};


export default InAppNotificationList;
