import React from 'react';

import { useSWRxInAppNotificationStatus } from '~/stores/in-app-notification';

export const NotificationCountBadge: React.FC = () => {
  const { data: inAppNotificationStatus } = useSWRxInAppNotificationStatus();
  return (
    <>
      { inAppNotificationStatus }
      <span className="material-symbols-outlined">notifications</span>
    </>
  );
};
