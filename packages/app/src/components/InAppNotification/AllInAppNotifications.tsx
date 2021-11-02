import React, { FC, useState, useEffect } from 'react';

import AppContainer from '../../client/services/AppContainer';
import loggerFactory from '~/utils/logger';

import InAppNotificationList from './InAppNotificationList';
import { withUnstatedContainers } from '../UnstatedUtils';

const logger = loggerFactory('growi:ALlInAppnotification');

type Props = {
  appContainer: AppContainer,

};

const AllInAppNotifications: FC<Props> = (props: Props) => {
  const { appContainer } = props;
  const [notifications, setNotifications] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchNotificationList();
  }, []);


  const fetchNotificationList = async() => {
    const limit = 6;
    try {
      const paginationResult = await appContainer.apiv3Get('/in-app-notification/list', { limit });

      setNotifications(paginationResult.data.docs);
      setIsLoaded(true);
    }
    catch (err) {
      logger.error(err);
    }
  };

  return (
    <InAppNotificationList notifications={notifications} isLoaded={isLoaded} />
  );
};

/**
 * Wrapper component for using unstated
 */
const AllInAppNotificationsWrapper = withUnstatedContainers(AllInAppNotifications, [AppContainer]);

export default AllInAppNotificationsWrapper;
