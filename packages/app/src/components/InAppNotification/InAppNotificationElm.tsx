import React from 'react';

import { UserPicture } from '@growi/ui';
import { IInAppNotification } from '~/interfaces/in-app-notification';
import { HasObjectId } from '~/interfaces/has-object-id';

// Change the display for each targetmodel
import PageModelNotification from './PageNotification/PageModelNotification';

interface Props {
  notification: IInAppNotification & HasObjectId
}

const InAppNotificationElm = (props: Props): JSX.Element => {

  const { notification } = props;

  const getActionUsers = () => {
    const latestActionUsers = notification.actionUsers.slice(0, 3);
    const latestUsers = latestActionUsers.map((user) => {
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
      actionIcon = 'ti-agenda';
      break;
    case 'PAGE_RENAME':
      actionMsg = 'renamed';
      actionIcon = 'icon-action-redo';
      break;
    case 'PAGE_DELETE':
      actionMsg = 'deleted';
      actionIcon = 'icon-trash';
      break;
    case 'PAGE_DELETE_COMPLETELY':
      actionMsg = 'completely deleted';
      actionIcon = 'icon-fire';
      break;
    case 'COMMENT_CREATE':
      actionMsg = 'commented on';
      actionIcon = 'icon-bubble';
      break;
    default:
      actionMsg = '';
      actionIcon = '';
  }

  return (
    <div className="dropdown-item d-flex flex-row mb-3 grw-notification-elm">
      <div className="p-2 mr-2 d-flex align-items-center">
        <span className={`${notification.status === 'UNOPENED' ? 'grw-unopend-notification' : 'ml-2'} rounded-circle mr-3`}></span>
        {renderActionUserPictures()}
      </div>
      {notification.targetModel === 'Page' && (
        <PageModelNotification
          notification={notification}
          actionMsg={actionMsg}
          actionIcon={actionIcon}
          actionUsers={actionUsers}
        />
      )}
    </div>
  );
};

export default InAppNotificationElm;
