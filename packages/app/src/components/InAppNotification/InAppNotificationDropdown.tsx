import React, { useState, useEffect, FC } from 'react';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import loggerFactory from '~/utils/logger';

import AppContainer from '../../client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';
import { InAppNotification as IInAppNotification } from '../../interfaces/in-app-notification';
import { InAppNotification } from './InAppNotification';
import SocketIoContainer from '../../client/services/SocketIoContainer';

const logger = loggerFactory('growi:InAppNotificationDropdown');


type Props = {
  appContainer: AppContainer,
  socketIoContainer: SocketIoContainer,
};

const InAppNotificationDropdown: FC<Props> = (props: Props) => {
  const { appContainer } = props;

  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

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

  /**
    * TODO: Fetch notification list by GW-7473
    */
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


  const toggleDropdownHandler = () => {
    if (isOpen === false && count > 0) {
      updateNotificationStatus();
    }

    const newIsOpenState = !isOpen;
    setIsOpen(newIsOpenState);

    if (newIsOpenState === true) {
      fetchNotificationList();
    }
  };

  /**
    * TODO: Jump to the page by clicking on the notification by GW-7472
    */

  const notificationClickHandler = async(notification: Notification) => {
    try {
      // await this.props.crowi.apiPost('/notification.open', { id: notification._id });
      // jump to target page
      // window.location.href = notification.target.path;
    }
    catch (err) {
      logger.error(err);
    }
  };

  const RenderUnLoadedInAppNotification = (): JSX.Element => {
    return (
      <i className="fa fa-spinner"></i>
    );
  };

  const RenderEmptyInAppNotification = (): JSX.Element => {
    return (
      // TODO: apply i18n by #78569
      <>You had no notifications, yet.</>
    );
  };

  // TODO: improve renderInAppNotificationList by GW-7535
  // refer to https://github.com/crowi/crowi/blob/eecf2bc821098d2516b58104fe88fae81497d3ea/client/components/Notification/Notification.tsx
  const RenderInAppNotificationList = () => {
    console.log('notificationsHoge', notifications);


    if (notifications.length === 0) {
      return <RenderEmptyInAppNotification />;
    }
    const notificationList = notifications.map((notification: IInAppNotification) => {
      return (
        <div className="my-2" key={notification._id}>
          <InAppNotification notification={notification} onClick={notificationClickHandler} />
        </div>
      );
    });
    return <>{notificationList}</>;
  };

  const InAppNotificationContents = (): JSX.Element => {
    if (!isLoaded) {
      return <RenderUnLoadedInAppNotification />;
    }
    return <RenderInAppNotificationList />;
  };

  const badge = count > 0 ? <span className="badge badge-pill badge-danger grw-notification-badge">{count}</span> : '';

  return (
    <Dropdown className="notification-wrapper" isOpen={isOpen} toggle={toggleDropdownHandler}>
      <DropdownToggle tag="a" className="nav-link">
        <i className="icon-bell mr-2" /> {badge}
      </DropdownToggle>
      <DropdownMenu right>
        <InAppNotificationContents />
        <DropdownItem divider />
        {/* TODO: Able to show all notifications by #79317 */}
        <a className="d-flex align-items-center justify-content-center">See All</a>
      </DropdownMenu>
    </Dropdown>
  );
};

/**
 * Wrapper component for using unstated
 */
const InAppNotificationDropdownWrapper = withUnstatedContainers(InAppNotificationDropdown, [AppContainer, SocketIoContainer]);

export default InAppNotificationDropdownWrapper;
