import React, { useState, useEffect, FC } from 'react';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import PropTypes from 'prop-types';
import AppContainer from '../../client/services/AppContainer';
import { toastError } from '../../client/util/apiNotification';
import { withUnstatedContainers } from '../UnstatedUtils';
import { InAppNotification as IInAppNotification } from '../../interfaces/in-app-notification';
// import DropdownMenu from './InAppNotificationDropdown/DropdownMenu';
// import Crowi from 'client/util/Crowi'
// import { Notification } from 'client/types/crowi'
import { InAppNotification } from './InAppNotification';
import SocketIoContainer from '../../client/services/SocketIoContainer';


const InAppNotificationDropdown: FC = (props) => {
  const { appContainer } = props;

  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    initializeSocket(props);
    // fetchNotificationList(props);
  }, []);

  const initializeSocket = (props) => {
    console.log(props);

    const socket = props.socketIoContainer.getSocket();
    socket.on('commentUpdated', (data: { userId: string, count: number }) => {
      // eslint-disable-next-line no-console
      console.log('socketData', data);
    });
  };

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
      const paginationResult = await appContainer.apiv3Get('/in-app-notification/list', { limit });
      console.log('paginationResult', paginationResult);

      setNotifications(paginationResult.data.docs);
      setIsLoaded(true);
    }
    catch (err) {
      // TODO: error handling
      console.log('err', err);
    }
  };

  const toggleDropdownHandler = () => {
    if (isOpen === false && count > 0) {
      updateNotificationStatus();
    }

    const toggleIsOpen = !isOpen;
    setIsOpen(toggleIsOpen);

    if (toggleIsOpen === true) {
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
    console.log('notificationsHoge', notifications);


    if (notifications.length === 0) {
      return <RenderEmptyInAppNotification />;
    }
    const notificationList = notifications.map((notification: IInAppNotification) => {
      return (
        // temporaly notification list. need to delete by #79077
        <div key={notification._id}>action: {notification.action} </div>
        // use this component to show notification list
        // <InAppNotification key={notification._id} notification={notification} onClick={notificationClickHandler} />
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
const InAppNotificationDropdownWrapper = withUnstatedContainers(InAppNotificationDropdown, [AppContainer, SocketIoContainer]);

InAppNotificationDropdown.propTypes = {
  me: PropTypes.string,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  socketIoContainer: PropTypes.instanceOf(SocketIoContainer).isRequired,
};

export default InAppNotificationDropdownWrapper;
