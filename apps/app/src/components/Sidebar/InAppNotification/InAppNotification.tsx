import React, { Suspense, useState } from 'react';

import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

import ItemsTreeContentSkeleton from '../../ItemsTree/ItemsTreeContentSkeleton';

import { InAppNotificationForms } from './InAppNotificationSubstance';

const InAppNotificationContent = dynamic(() => import('./InAppNotificationSubstance').then(mod => mod.InAppNotificationContent), { ssr: false });

export const InAppNotification = (): JSX.Element => {
  const { t } = useTranslation();

  const [isUnreadNotificationsVisible, setUnreadNotificationsVisible] = useState(false);

  return (
    <div className="px-3">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0">
          {t('In-App Notification')}
        </h3>
      </div>

      <InAppNotificationForms
        onChangeUnreadNotificationsVisible={() => { setUnreadNotificationsVisible(!isUnreadNotificationsVisible) }}
      />

      <Suspense fallback={<ItemsTreeContentSkeleton />}>
        <InAppNotificationContent isUnreadNotificationsVisible={isUnreadNotificationsVisible} />
      </Suspense>
    </div>
  );
};
