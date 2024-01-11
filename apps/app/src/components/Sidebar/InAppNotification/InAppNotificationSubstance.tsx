import React from 'react';

import InAppNotificationList from '~/components/InAppNotification/InAppNotificationList';
import { useSWRxInAppNotifications } from '~/stores/in-app-notification';

export const InAppNotificationSubstance = (): JSX.Element => {

  const { data: inAppNotificationData } = useSWRxInAppNotifications(6, undefined, undefined, { revalidateOnFocus: true });

  return (
    <>
      <InAppNotificationList type="dropdown-item" inAppNotificationData={inAppNotificationData} />
    </>
  );
};
