import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
// import DropdownMenu from './InAppNotificationDropdown/DropdownMenu';
// import Icon from './Common/Icon'
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
  //   this.fetchList();
  //   this.fetchStatus();
  // }

  // initializeSocket() {
  //   this.props.crowi.getWebSocket().on('notification updated', (data: { user: string }) => {
  //     if (this.props.me === data.user) {
  //       this.fetchList();
  //       this.fetchStatus();
  //     }
  //   });
  // }

  // async fetchStatus() {
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

  const updateStatus = () => {
    try {
      // await this.props.crowi.apiPost('/notification.read');
      setCount(0);
    }
    catch (err) {
      // TODO: error handling
    }
  };

  // async fetchList() {
  //   const limit = 6;
  //   try {
  //     const { notifications } = await this.props.crowi.apiGet('/notification.list', { limit });
  //     this.setState({ loaded: true, notifications });
  //   }
  //   catch (err) {
  //     // TODO: error handling
  //   }
  // }

  const onToggleDropdown = () => {
    if (isOpen != null && count > 0) {
      updateStatus();
    }
    setIsOpen(!isOpen);
  };

  // async handleNotificationOnClick(notification: Notification) {
  //   try {
  //     await this.props.crowi.apiPost('/notification.open', { id: notification._id });
  //     // jump to target page
  //     window.location.href = notification.target.path;
  //   }
  //   catch (err) {
  //     // TODO: error handling
  //   }
  // }

  const badge = count > 0 ? <span className="badge badge-pill badge-danger notification-badge">{count}</span> : '';

  return (
    <Dropdown className="notification-wrapper" isOpen={isOpen} toggle={onToggleDropdown}>
      <DropdownToggle tag="a" className="nav-link">
        <i className="icon-bell mr-2"></i>
        {badge}
      </DropdownToggle>
      <DropdownMenu>hoge</DropdownMenu>
    </Dropdown>
  );

};

export default InAppNotificationDropdown;
