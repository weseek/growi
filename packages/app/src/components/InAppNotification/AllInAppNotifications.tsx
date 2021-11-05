import React, { FC, useState, useEffect } from 'react';

import AppContainer from '../../client/services/AppContainer';
import loggerFactory from '~/utils/logger';

import InAppNotificationList from './InAppNotificationList';
import { withUnstatedContainers } from '../UnstatedUtils';
import { useSWRxInAppNotifications } from '../../stores/in-app-notification';

const logger = loggerFactory('growi:ALlInAppnotification');

type Props = {
  appContainer: AppContainer,

};

const AllInAppNotifications: FC<Props> = (props: Props) => {
  const { appContainer } = props;
  // const [notifications, setNotifications] = useState([]);
  const limit = 6;
  console.log('useSWRxInAppNotification_notifications', inAppNotificationdata);
  const { data: inAppNotificationData, error, mutate } = useSWRxInAppNotifications(limit);

  const [isLoaded, setIsLoaded] = useState(false);


  // useEffect(() => {
  //   fetchNotificationList();
  // }, []);


  // const fetchNotificationList = async() => {
  // const limit = 6;
  // try {
  // const paginationResult = await appContainer.apiv3Get('/in-app-notification/list', { limit });

  // setNotifications(paginationResult.data.docs);
  //     setIsLoaded(true);
  //   }
  //   catch (err) {
  //     logger.error(err);
  //   }
  // };

  // if (inAppNotificationData == null) {
  //   return (
  //     <div className="wiki">
  //       <div className="text-muted text-center">
  //         <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
  //       </div>
  //     </div>
  //   );
  // }

  // const notifications = inAppNotificationData.docs;
  return (
    <InAppNotificationList inAppNotificationData={inAppNotificationData} />
  );
};

/**
 * Wrapper component for using unstated
 */
const AllInAppNotificationsWrapper = withUnstatedContainers(AllInAppNotifications, [AppContainer]);

export default AllInAppNotificationsWrapper;
