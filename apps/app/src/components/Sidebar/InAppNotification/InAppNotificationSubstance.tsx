import React from 'react';

import InAppNotificationList from '~/components/InAppNotification/InAppNotificationList';
import { InAppNotificationStatuses } from '~/interfaces/in-app-notification';
import { useSWRxInAppNotifications } from '~/stores/in-app-notification';


type InAppNotificationFormsProps = {
  onChangeUnreadNotificationVisible: () => void
}
export const InAppNotificationForms = (props: InAppNotificationFormsProps): JSX.Element => {
  const { onChangeUnreadNotificationVisible } = props;

  return (
    <div className="px-4 mt-2 mb-2">
      <div className="form-check form-switch">
        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Only unread</label>
        <input
          id="flexSwitchCheckDefault"
          className="form-check-input"
          type="checkbox"
          role="switch"
          onChange={onChangeUnreadNotificationVisible}
        />
      </div>
    </div>
  );
};


type InAppNotificationSubstanceProps = {
  isUnreadNotificationsVisible: boolean
}
export const InAppNotificationSubstance = (props: InAppNotificationSubstanceProps): JSX.Element => {
  const { isUnreadNotificationsVisible } = props;

  // TODO: Infinite scroll implemented (https://redmine.weseek.co.jp/issues/138057)
  const { data: inAppNotificationData } = useSWRxInAppNotifications(
    6,
    undefined,
    isUnreadNotificationsVisible ? InAppNotificationStatuses.STATUS_UNREAD : undefined,
    { revalidateOnFocus: true },
  );

  return (
    <>
      <InAppNotificationList type="list" inAppNotificationData={inAppNotificationData} />
    </>
  );
};
