import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { IInAppNotification, PaginateResult } from '~/interfaces/in-app-notification';
import { HasObjectId } from '~/interfaces/has-object-id';
import InAppNotificationElm from './InAppNotificationElm';


type Props = {
  inAppNotificationData?: PaginateResult<IInAppNotification>;
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
    const inAppNotificationList = notifications.map((notification: IInAppNotification & HasObjectId) => {

      if (notification.targetModel === 'Page') {
        const snapshot = JSON.parse(notification.snapshot);

        return (
          <div className="d-flex flex-row" key={notification._id}>
            <InAppNotificationElm notification={notification} pagePath={snapshot.path} />
          </div>
        );
      }

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
