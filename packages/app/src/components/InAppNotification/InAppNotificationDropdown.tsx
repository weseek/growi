import React, {
  useState, useEffect, FC, useCallback,
} from 'react';

import { useTranslation } from 'react-i18next';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import SocketIoContainer from '~/client/services/SocketIoContainer';
import { toastError } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import { useSWRxInAppNotifications, useSWRxInAppNotificationStatus } from '~/stores/in-app-notification';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../UnstatedUtils';

import InAppNotificationList from './InAppNotificationList';


const logger = loggerFactory('growi:InAppNotificationDropdown');

type Props = {
  socketIoContainer: SocketIoContainer,
};

const InAppNotificationDropdown: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const limit = 6;
  const { data: inAppNotificationData, mutate: mutateInAppNotificationData } = useSWRxInAppNotifications(limit);
  const { data: inAppNotificationUnreadStatusCount, mutate: mutateInAppNotificationUnreadStatusCount } = useSWRxInAppNotificationStatus();


  const initializeSocket = useCallback((props) => {
    const socket = props.socketIoContainer.getSocket();
    socket.on('notificationUpdated', () => {
      mutateInAppNotificationUnreadStatusCount();
    });
  }, [mutateInAppNotificationUnreadStatusCount]);

  const updateNotificationStatus = async() => {
    try {
      await apiv3Post('/in-app-notification/read');
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  useEffect(() => {
    initializeSocket(props);
  }, [initializeSocket, props]);


  const toggleDropdownHandler = async() => {
    if (!isOpen && inAppNotificationUnreadStatusCount != null && inAppNotificationUnreadStatusCount > 0) {
      await updateNotificationStatus();
      mutateInAppNotificationUnreadStatusCount();
    }

    const newIsOpenState = !isOpen;
    if (newIsOpenState) {
      mutateInAppNotificationData();
    }
    setIsOpen(newIsOpenState);
  };

  let badge;
  if (inAppNotificationUnreadStatusCount != null && inAppNotificationUnreadStatusCount > 0) {
    badge = <span className="badge badge-pill badge-danger grw-notification-badge">{inAppNotificationUnreadStatusCount}</span>;
  }
  else {
    badge = '';
  }

  return (
    <Dropdown className="notification-wrapper grw-notification-dropdown" isOpen={isOpen} toggle={toggleDropdownHandler}>
      <DropdownToggle tag="a" className="px-3 nav-link border-0 bg-transparent waves-effect waves-light">
        <i className="icon-bell" /> {badge}
      </DropdownToggle>
      <DropdownMenu right>
        { inAppNotificationData != null && inAppNotificationData.docs.length === 0
          // no items
          ? <DropdownItem disabled>{t('in_app_notification.mark_all_as_read')}</DropdownItem>
          // render DropdownItem
          : <InAppNotificationList type="dropdown-item" inAppNotificationData={inAppNotificationData} />
        }
        <DropdownItem divider />
        <DropdownItem tag="a" href="/me/all-in-app-notifications">
          { t('in_app_notification.see_all') }
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

/**
 * Wrapper component for using unstated
 */
const InAppNotificationDropdownWrapper = withUnstatedContainers(InAppNotificationDropdown, [SocketIoContainer]);

export default InAppNotificationDropdownWrapper;
