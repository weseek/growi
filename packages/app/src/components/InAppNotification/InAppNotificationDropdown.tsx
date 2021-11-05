import React, { useState, useEffect, FC } from 'react';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import loggerFactory from '~/utils/logger';

import AppContainer from '../../client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';
import InAppNotificationList from './InAppNotificationList';
import SocketIoContainer from '../../client/services/SocketIoContainer';
import { useSWRxInAppNotifications } from '../../stores/in-app-notification';

const logger = loggerFactory('growi:InAppNotificationDropdown');

type Props = {
  appContainer: AppContainer,
  socketIoContainer: SocketIoContainer,
};

const InAppNotificationDropdown: FC<Props> = (props: Props) => {
  const { appContainer } = props;

  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const limit = 6;
  const { data: inAppNotificationData } = useSWRxInAppNotifications(limit);

  useEffect(() => {
    initializeSocket(props);
    fetchNotificationStatus();
  }, []);

  const initializeSocket = (props) => {
    const socket = props.socketIoContainer.getSocket();
    socket.on('notificationUpdated', (data: { userId: string, count: number }) => {
      setCount(data.count);
      // eslint-disable-next-line no-console
      console.log('socketData', data);
    });
  };

  const updateNotificationStatus = async() => {
    try {
      await appContainer.apiv3Post('/in-app-notification/read');
      setCount(0);
    }
    catch (err) {
      logger.error(err);
    }
  };

  const fetchNotificationStatus = async() => {
    try {
      const res = await appContainer.apiv3Get('/in-app-notification/status');
      const { count } = res.data;
      setCount(count);
    }
    catch (err) {
      logger.error(err);
    }
  };

  const toggleDropdownHandler = () => {
    if (isOpen === false && count > 0) {
      updateNotificationStatus();
    }

    const newIsOpenState = !isOpen;
    setIsOpen(newIsOpenState);
  };

  /**
    * TODO: Jump to the page by clicking on the notification by GW-7472
    */


  const badge = count > 0 ? <span className="badge badge-pill badge-danger grw-notification-badge">{count}</span> : '';


  // const notifications = inAppNotificationData.docs;

  return (
    <Dropdown className="notification-wrapper" isOpen={isOpen} toggle={toggleDropdownHandler}>
      <DropdownToggle tag="a">
        <button type="button" className="nav-link border-0 bg-transparent waves-effect waves-light">
          <i className="icon-bell mr-2" /> {badge}
        </button>
      </DropdownToggle>
      <DropdownMenu className="px-2" right>
        <InAppNotificationList inAppNotificationData={inAppNotificationData} />
        <DropdownItem divider />
        {/* TODO: Able to show all notifications by #79317 */}
        <a className="dropdown-item d-flex justify-content-center" href="/me/all-in-app-notifications">See All</a>
      </DropdownMenu>
    </Dropdown>
  );
};

/**
 * Wrapper component for using unstated
 */
const InAppNotificationDropdownWrapper = withUnstatedContainers(InAppNotificationDropdown, [AppContainer, SocketIoContainer]);

export default InAppNotificationDropdownWrapper;
