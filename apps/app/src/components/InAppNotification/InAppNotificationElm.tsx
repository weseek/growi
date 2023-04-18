import React, {
  FC, useRef,
} from 'react';

import { HasObjectId } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import { DropdownItem } from 'reactstrap';

import { IInAppNotificationOpenable } from '~/client/interfaces/in-app-notification-openable';
import { apiv3Post } from '~/client/util/apiv3-client';
import { IInAppNotification, InAppNotificationStatuses } from '~/interfaces/in-app-notification';

// Change the display for each targetmodel
import PageModelNotification from './PageNotification/PageModelNotification';
import UserModelNotification from './PageNotification/UserModelNotification';

interface Props {
  notification: IInAppNotification & HasObjectId
  elemClassName?: string,
  type?: 'button' | 'dropdown-item',
}


const InAppNotificationElm: FC<Props> = (props: Props) => {

  const { notification } = props;

  const notificationRef = useRef<IInAppNotificationOpenable>(null);

  const clickHandler = async(notification: IInAppNotification & HasObjectId): Promise<void> => {
    if (notification.status === InAppNotificationStatuses.STATUS_UNOPENED) {
      // set notification status "OPEND"
      await apiv3Post('/in-app-notification/open', { id: notification._id });
    }

    const currentInstance = notificationRef.current;
    if (currentInstance != null) {
      currentInstance.open();
    }
  };

  const getActionUsers = () => {
    const latestActionUsers = notification.actionUsers.slice(0, 3);
    const latestUsers = latestActionUsers.map((user) => {
      if (user == null) {
        return;
      }
      return `@${user.name}`;
    });

    let actionedUsers = '';
    const latestUsersCount = latestUsers.length;
    if (latestUsersCount === 1) {
      actionedUsers = latestUsers[0];
    }
    else if (notification.actionUsers.length >= 4) {
      actionedUsers = `${latestUsers.slice(0, 2).join(', ')} and ${notification.actionUsers.length - 2} others`;
    }
    else {
      actionedUsers = latestUsers.join(', ');
    }

    return actionedUsers;
  };

  const renderActionUserPictures = (): JSX.Element => {
    const actionUsers = notification.actionUsers;

    if (actionUsers.length < 1) {
      return <></>;
    }
    if (actionUsers.length === 1) {
      return <UserPicture user={actionUsers[0]} size="md" noTooltip />;
    }
    return (
      <div className="position-relative">
        <UserPicture user={actionUsers[0]} size="md" noTooltip />
        <div className="position-absolute" style={{ top: 10, left: 10 }}>
          <UserPicture user={actionUsers[1]} size="md" noTooltip />
        </div>
      </div>
    );
  };

  const actionUsers = getActionUsers();

  const actionType: string = notification.action;
  let actionMsg: string;
  let actionIcon: string;

  switch (actionType) {
    case 'PAGE_LIKE':
      actionMsg = 'liked';
      actionIcon = 'icon-like';
      break;
    case 'PAGE_BOOKMARK':
      actionMsg = 'bookmarked on';
      actionIcon = 'icon-star';
      break;
    case 'PAGE_UPDATE':
      actionMsg = 'updated on';
      actionIcon = 'ti ti-agenda';
      break;
    case 'PAGE_RENAME':
      actionMsg = 'renamed';
      actionIcon = 'icon-action-redo';
      break;
    case 'PAGE_DUPLICATE':
      actionMsg = 'duplicated';
      actionIcon = 'icon-docs';
      break;
    case 'PAGE_DELETE':
      actionMsg = 'deleted';
      actionIcon = 'icon-trash';
      break;
    case 'PAGE_DELETE_COMPLETELY':
      actionMsg = 'completely deleted';
      actionIcon = 'icon-fire';
      break;
    case 'PAGE_REVERT':
      actionMsg = 'reverted';
      actionIcon = 'icon-action-undo';
      break;
    case 'PAGE_RECURSIVELY_RENAME':
      actionMsg = 'renamed under';
      actionIcon = 'icon-action-redo';
      break;
    case 'PAGE_RECURSIVELY_DELETE':
      actionMsg = 'deleted under';
      actionIcon = 'icon-trash';
      break;
    case 'PAGE_RECURSIVELY_DELETE_COMPLETELY':
      actionMsg = 'deleted completely under';
      actionIcon = 'icon-fire';
      break;
    case 'PAGE_RECURSIVELY_REVERT':
      actionMsg = 'reverted under';
      actionIcon = 'icon-action-undo';
      break;
    case 'COMMENT_CREATE':
      actionMsg = 'commented on';
      actionIcon = 'icon-bubble';
      break;
    case 'USER_REGISTRATION_APPROVAL_REQUEST':
      actionMsg = 'requested registration approval';
      actionIcon = 'icon-bubble';
      break;
    default:
      actionMsg = '';
      actionIcon = '';
  }

  const isDropdownItem = props.type === 'dropdown-item';

  // determine tag
  const TagElem = isDropdownItem
    ? DropdownItem
    // eslint-disable-next-line react/prop-types
    : props => <button type="button" {...props}>{props.children}</button>;

  return (
    <TagElem className={props.elemClassName} onClick={() => clickHandler(notification)}>
      <div className="d-flex align-items-center">
        <span
          className={`${notification.status === InAppNotificationStatuses.STATUS_UNOPENED
            ? 'grw-unopend-notification'
            : 'ml-2'
          } rounded-circle mr-3`}
        >
        </span>
        {renderActionUserPictures()}
        {notification.targetModel === 'Page' && (
          <PageModelNotification
            ref={notificationRef}
            notification={notification}
            actionMsg={actionMsg}
            actionIcon={actionIcon}
            actionUsers={actionUsers}
          />
        )}
        {notification.targetModel === 'User' && (
          <UserModelNotification
            ref={notificationRef}
            notification={notification}
            actionMsg={actionMsg}
            actionIcon={actionIcon}
            actionUsers={notification.target.username}
          />
        )}
      </div>
    </TagElem>
  );
};

export default InAppNotificationElm;
