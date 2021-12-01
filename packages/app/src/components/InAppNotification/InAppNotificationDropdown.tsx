import React, { useState, useEffect, FC } from 'react';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';

import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';
import { withUnstatedContainers } from '../UnstatedUtils';
import InAppNotificationList from './InAppNotificationList';
import SocketIoContainer from '~/client/services/SocketIoContainer';
import { useSWRxInAppNotifications, useSWRxInAppNotificationStatus } from '~/stores/in-app-notification';

const logger = loggerFactory('growi:InAppNotificationDropdown');

type Props = {
  socketIoContainer: SocketIoContainer,
};

const InAppNotificationDropdown: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  // const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const limit = 6;
  const { data: inAppNotificationData, mutate } = useSWRxInAppNotifications(limit);
  const { data: inAppNotificationStatusData } = useSWRxInAppNotificationStatus();


  const initializeSocket = (props) => {
    const socket = props.socketIoContainer.getSocket();
    socket.on('notificationUpdated', (data: { userId: string, count: number }) => {
      // setCount(data.count);
    });
  };

  const updateNotificationStatus = async() => {
    try {
      await apiv3Post('/in-app-notification/read');
      // setCount(0);
    }
    catch (err) {
      logger.error(err);
    }
  };

  const fetchNotificationStatus = async() => {
    try {
      // const res = await apiv3Get('/in-app-notification/status');
      // const { count } = res.data;
      if (inAppNotificationStatusData != null) {
        console.log('inAppNotificationStatusData', inAppNotificationStatusData);
        const { count } = inAppNotificationStatusData;
        // setCount(count);
      }
    }
    catch (err) {
      logger.error(err);
    }
  };

  useEffect(() => {
    initializeSocket(props);
    fetchNotificationStatus();
  }, [props]);


  const toggleDropdownHandler = () => {
    if (!isOpen && inAppNotificationStatusData != null && inAppNotificationStatusData.count > 0) {
      updateNotificationStatus();
    }

    const newIsOpenState = !isOpen;
    if (newIsOpenState) {
      mutate();
    }
    setIsOpen(newIsOpenState);
  };

  // const { count } = inAppNotificationStatusData;

  let badge;
  if (inAppNotificationStatusData != null && inAppNotificationStatusData.count > 0) {
    badge = <span className="badge badge-pill badge-danger grw-notification-badge">{inAppNotificationStatusData.count}</span>;
  }
  else {
    badge = '';
  }

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
        <a className="dropdown-item d-flex justify-content-center" href="/me/all-in-app-notifications">{ t('in_app_notification.see_all') }</a>
      </DropdownMenu>
    </Dropdown>
  );
};

/**
 * Wrapper component for using unstated
 */
const InAppNotificationDropdownWrapper = withUnstatedContainers(InAppNotificationDropdown, [SocketIoContainer]);

export default InAppNotificationDropdownWrapper;
