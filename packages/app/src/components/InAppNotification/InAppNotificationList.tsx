import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { IInAppNotification } from '../../interfaces/in-app-notification';
import InAppNotificationElm from './InAppNotificationElm';


type Props = {
  // TODO: import @types/mongoose-paginate-v2 and use PaginateResult as a type after upgrading mongoose v6.0.0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inAppNotificationData: any;
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
