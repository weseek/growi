import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
// import DropdownMenu from './InAppNotificationDropdown/DropdownMenu';
// import Crowi from 'client/util/Crowi'
// import { Notification } from 'client/types/crowi'

interface Props {
  // crowi: Crowi
  me: string
}

interface State {
  count: number
  loaded: boolean
  notifications: Notification[]
  isOpen: boolean
}

const InAppNotificationDropdown = (props: Props) => {

  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // componentDidMount() {
  //   this.initializeSocket();
  //   this.fetchNotificationList();
  //   this.fetchNotificationStatus();
  // }

  /**
    * TODO: Listen to socket on the client side by GW-7402
    */
  // initializeSocket() {
  //   this.props.crowi.getWebSocket().on('notification updated', (data: { user: string }) => {
  //     if (this.props.me === data.user) {
  //       this.fetchNotificationList();
  //       this.fetchNotificationStatus();
  //     }
  //   });
  // }

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
    * TODO: Jump to the page by Click the notification by GW-7472
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

export default InAppNotificationDropdown;
