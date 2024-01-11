import React, { Suspense, useState } from 'react';

import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

import ItemsTreeContentSkeleton from '../../ItemsTree/ItemsTreeContentSkeleton';

import { InAppNotificationForms } from './InAppNotificationSubstance';

const InAppNotificationSubstance = dynamic(() => import('./InAppNotificationSubstance').then(mod => mod.InAppNotificationSubstance), { ssr: false });

export const InAppNotification = (): JSX.Element => {
  const { t } = useTranslation();

  const [isUnreadNotificationsVisible, setUnreadNotificationsVisible] = useState(false);

  return (
    <div className="px-3 ">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0">
          {t('In-App Notification')}
        </h3>
      </div>

      <InAppNotificationForms
        onChangeUnreadNotificationVisible={() => { setUnreadNotificationsVisible(!isUnreadNotificationsVisible) }}
      />

      <Suspense fallback={<ItemsTreeContentSkeleton />}>
        <InAppNotificationSubstance isUnreadNotificationsVisible={isUnreadNotificationsVisible} />
      </Suspense>
    </div>
  );
};
