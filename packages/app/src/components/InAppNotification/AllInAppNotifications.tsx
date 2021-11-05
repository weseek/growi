import React, { FC } from 'react';

import AppContainer from '../../client/services/AppContainer';

import InAppNotificationList from './InAppNotificationList';
import { withUnstatedContainers } from '../UnstatedUtils';
import { useSWRxInAppNotifications } from '../../stores/in-app-notification';

type Props = {
  appContainer: AppContainer,

};

const AllInAppNotifications: FC<Props> = (props: Props) => {
  // const [notifications, setNotifications] = useState([]);
  const limit = 6;
  const { data: inAppNotificationData } = useSWRxInAppNotifications(limit);

  return (
    <InAppNotificationList inAppNotificationData={inAppNotificationData} />
  );
};

/**
 * Wrapper component for using unstated
 */
const AllInAppNotificationsWrapper = withUnstatedContainers(AllInAppNotifications, [AppContainer]);

export default AllInAppNotificationsWrapper;
