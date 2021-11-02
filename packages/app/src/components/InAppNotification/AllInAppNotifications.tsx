import React, { FC, useState, useEffect } from 'react';

import AppContainer from '../../client/services/AppContainer';

import InAppNotificationContents from './InAppNotificationContents';
import { withUnstatedContainers } from '../UnstatedUtils';

type Props = {
  appContainer: AppContainer,

};

const AllInAppNotifications: FC<Props> = (props: Props) => {
  const { appContainer } = props;
  const [notifications, setNotifications] = useState([]);
  // const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchNotificationList();
  }, []);


  /**
    * TODO: Fetch notification list by GW-7473
    */
  const fetchNotificationList = async() => {
    const limit = 6;
    try {
      const paginationResult = await appContainer.apiv3Get('/in-app-notification/list', { limit });

      setNotifications(paginationResult.data.docs);
      // setIsLoaded(true);
    }
    catch (err) {
      // logger.error(err);
    }
  };

  return (
    <InAppNotificationContents notifications={notifications} />
  );
};

/**
 * Wrapper component for using unstated
 */
const AllInAppNotificationsWrapper = withUnstatedContainers(AllInAppNotifications, [AppContainer]);

export default AllInAppNotificationsWrapper;
