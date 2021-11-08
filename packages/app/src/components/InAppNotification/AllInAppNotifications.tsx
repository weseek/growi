import React, { FC } from 'react';

import InAppNotificationList from './InAppNotificationList';
import { useSWRxInAppNotifications } from '../../stores/in-app-notification';


const AllInAppNotifications: FC = () => {
  const limit = 6;
  const { data: inAppNotificationData } = useSWRxInAppNotifications(limit);

  return (
    <InAppNotificationList inAppNotificationData={inAppNotificationData} />
  );
};

export default AllInAppNotifications;
