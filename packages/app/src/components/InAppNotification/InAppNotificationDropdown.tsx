import React, { useState, useEffect, FC } from 'react';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { withUnstatedContainers } from '../UnstatedUtils';
import { InAppNotification as InAppNotificationType } from '../../interfaces/in-app-notification-types';
// import DropdownMenu from './InAppNotificationDropdown/DropdownMenu';
// import Crowi from 'client/util/Crowi'
// import { Notification } from 'client/types/crowi'
import { InAppNotification } from './InAppNotification';
import SocketIoContainer from '../../client/services/SocketIoContainer';
// refer type https://github.com/crowi/crowi/blob/eecf2bc821098d2516b58104fe88fae81497d3ea/client/types/crowi.d.ts


const InAppNotificationDropdown: FC = (props) => {

  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotificationType[]>([{
    // This is dummy notification data. Delete it after fetching notification list by #78557
    _id: '1',
    user: 'kaori1',
    targetModel: 'Page',
    target: 'hogePage',
    action: 'COMMENT',
    status: 'hoge',
    actionUsers: ['taro', 'yamada'],
    createdAt: 'hoge',
  }]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    initializeSocket(props);
    // fetchNotificationList();
    // fetchNotificationStatus();
  }, []);

  const initializeSocket = (props) => {
    console.log(props);

    const socket = props.socketIoContainer.getSocket();
    socket.on('comment updated', (data: { user: string }) => {
      // eslint-disable-next-line no-console
      console.log('socketData', data);

      if (props.me === data.user) {
        // TODO: Fetch notification status by #78563
        // fetchNotificationList();

        // TODO: Fetch notification list by #78557
        // fetchNotificationStatus();
      }
    });
  };


  /**
    * TODO: Fetch notification status by #78563
    */
  // async fetchNotificationStatus() {
  //   try {
  //     const { count = null } = await this.props.crowi.apiGet('/notification.status');
  //     if (count !== null && count !== this.state.count) {
  //       this.setState({ count });
  //     }
  //   }
  //   catch (err) {
  //     // TODO: error handling
  //   }
  // }

  const updateNotificationStatus = () => {
    try {
      // await this.props.crowi.apiPost('/notification.read');
      setCount(0);
    }
    catch (err) {
      // TODO: error handling
    }
  };


  /**
    * TODO: Fetch notification list by GW-7473
    */

  const fetchNotificationList = async() => {
    const limit = 6;
    try {
      // const { notifications } = await this.props.crowi.apiGet('/notification.list', { limit });
      setIsLoaded(true);
      // setNotifications(notifications);
      // this.setState({ loaded: true, notifications });
    }
    catch (err) {
      // TODO: error handling
    }
  };

  const toggleDropdownHandler = () => {
    if (isOpen === false && count > 0) {
      updateNotificationStatus();
    }
    setIsOpen(!isOpen);
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
      // TODO: error handling
    }
  };

  const badge = count > 0 ? <span className="badge badge-pill badge-danger notification-badge">{count}</span> : '';


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


    if (notifications.length === 0) {
      return <RenderEmptyInAppNotification />;
    }
    const notificationList = notifications.map((notification: InAppNotificationType) => {
      return (
        <InAppNotification key={notification._id} notification={notification} onClick={notificationClickHandler} />
      );
    });
    return <>{notificationList}</>;
  };

  const InAppNotificationContents = (): JSX.Element => {
    // if (isLoaded === false) {
    //   return <RenderUnLoadedInAppNotification />;
    // }
    return <RenderInAppNotificationList />;
  };

  return (
    <Dropdown className="notification-wrapper" isOpen={isOpen} toggle={toggleDropdownHandler}>
      <DropdownToggle tag="a" className="nav-link">
        <i className="icon-bell mr-2"></i>
        {badge}
      </DropdownToggle>
      <DropdownMenu right>
        <InAppNotificationContents />
        <DropdownItem divider />
        {/* TODO: Able to show all notifications by GW-7534 */}
        <a>See All</a>
      </DropdownMenu>
    </Dropdown>
  );
};

/**
 * Wrapper component for using unstated
 */
const InAppNotificationDropdownWrapper = withUnstatedContainers(InAppNotificationDropdown, [SocketIoContainer]);

InAppNotificationDropdown.propTypes = {
  me: PropTypes.string,
  socketIoContainer: PropTypes.instanceOf(SocketIoContainer).isRequired,
};

export default InAppNotificationDropdownWrapper;
