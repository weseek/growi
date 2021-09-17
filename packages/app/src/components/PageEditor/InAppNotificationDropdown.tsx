import React, { useState, useEffect, FC } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import PropTypes from 'prop-types';
import { withUnstatedContainers } from '../UnstatedUtils';
// import DropdownMenu from './InAppNotificationDropdown/DropdownMenu';
// import Crowi from 'client/util/Crowi'
// import { Notification } from 'client/types/crowi'
import SocketIoContainer from '~/client/services/SocketIoContainer';


const InAppNotificationDropdown: FC = (props) => {
  console.log('propsHoge', props);

  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    initializeSocket(props);
    // fetchNotificationList();
    // fetchNotificationStatus();
  }, []);

  /**
    * TODO: Listen to socket on the client side by GW-7402
    */
  const initializeSocket = (props) => {
    console.log(props);

    const socket = props.socketIoContainer.getSocket();
    socket.on('comment updated', (data: { user: string }) => {
      console.log('socket', socket);
      // props.crowi.getWebSocket().on('comment updated', (data: { user: string }) => {
      if (props.me === data.user) {
        // fetchNotificationList();
        // fetchNotificationStatus();
      }
    });
  };


  /**
    * TODO: Fetch notification status by GW-7473
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

  const handleNotificationOnClick = async(notification: Notification) => {
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

  return (
    <Dropdown className="notification-wrapper" isOpen={isOpen} toggle={toggleDropdownHandler}>
      <DropdownToggle tag="a" className="nav-link">
        <i className="icon-bell mr-2"></i>
        {badge}
      </DropdownToggle>
      <DropdownMenu>hoge</DropdownMenu>
    </Dropdown>
  );

};

/**
 * Wrapper component for using unstated
 */
const InAppNotificationDropdownWrapper = withUnstatedContainers(InAppNotificationDropdown, [SocketIoContainer]);

InAppNotificationDropdown.propTypes = {
  // crowi: Crowi
  me: PropTypes.string,
  socketIoContainer: PropTypes.instanceOf(SocketIoContainer).isRequired,
};

export default InAppNotificationDropdownWrapper;
