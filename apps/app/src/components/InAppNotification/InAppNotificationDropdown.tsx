import React, { useState, useEffect, useRef } from 'react';

import { useTranslation } from 'next-i18next';
import { useRipple } from 'react-use-ripple';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';


import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';
import { useSWRxInAppNotifications, useSWRxInAppNotificationStatus } from '~/stores/in-app-notification';
import { useDefaultSocket } from '~/stores/socket-io';
import loggerFactory from '~/utils/logger';

import InAppNotificationList from './InAppNotificationList';


const logger = loggerFactory('growi:InAppNotificationDropdown');


export const InAppNotificationDropdown = (): JSX.Element => {
  const { t } = useTranslation('commons');

  const [isOpen, setIsOpen] = useState(false);
  const limit = 6;

  const { data: socket } = useDefaultSocket();
  const { data: inAppNotificationData, mutate: mutateInAppNotificationData } = useSWRxInAppNotifications(
    limit, undefined, undefined,
    { revalidateOnFocus: isOpen },
  );
  const { data: inAppNotificationUnreadStatusCount, mutate: mutateInAppNotificationUnreadStatusCount } = useSWRxInAppNotificationStatus();

  // ripple
  const buttonRef = useRef(null);
  useRipple(buttonRef, { rippleColor: 'rgba(255, 255, 255, 0.3)' });

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
    if (socket != null) {
      socket.on('notificationUpdated', () => {
        mutateInAppNotificationUnreadStatusCount();
      });

      // clean up
      return () => {
        socket.off('notificationUpdated');
      };
    }
  }, [mutateInAppNotificationUnreadStatusCount, socket]);


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
    <Dropdown className="notification-wrapper grw-notification-dropdown" isOpen={isOpen} toggle={toggleDropdownHandler} direction="right">
      <DropdownToggle className="px-3 nav-link border-0 bg-transparent" innerRef={buttonRef}>
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
