import React from 'react';

import { useTranslation } from 'next-i18next';

import InAppNotificationList from '~/components/InAppNotification/InAppNotificationList';
import { useSWRxInAppNotifications } from '~/stores/in-app-notification';

export const InAppNotificationSubstance = (): JSX.Element => {
  const { t } = useTranslation('commons');

  // TODO: Infinite scroll implemented (https://redmine.weseek.co.jp/issues/138057)
  const { data: inAppNotificationData } = useSWRxInAppNotifications(6, undefined, undefined, { revalidateOnFocus: true });

  return (
    <>
      {inAppNotificationData != null && inAppNotificationData.docs.length === 0
      // no items
        ? t('in_app_notification.mark_all_as_read')
      // render list-group
        : (
          <InAppNotificationList inAppNotificationData={inAppNotificationData} />
        )
      }
    </>
  );
};
