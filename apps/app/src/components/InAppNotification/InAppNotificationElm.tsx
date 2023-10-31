import React, {
  FC, useRef,
} from 'react';

import type { HasObjectId } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components';
import { DropdownItem } from 'reactstrap';

import { IInAppNotificationOpenable } from '~/client/interfaces/in-app-notification-openable';
import { apiv3Post } from '~/client/util/apiv3-client';
import { SupportedTargetModel } from '~/interfaces/activity';
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
    if (notification.targetModel === SupportedTargetModel.MODEL_USER) {
      return notification.target.username;
    }

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
            : 'ms-2'
          } rounded-circle me-3`}
        >
        </span>
        {renderActionUserPictures()}
        {notification.targetModel === SupportedTargetModel.MODEL_PAGE && (
          <PageModelNotification
            ref={notificationRef}
            notification={notification}
            actionUsers={actionUsers}
          />
        )}
        {notification.targetModel === SupportedTargetModel.MODEL_USER && (
          <UserModelNotification
            ref={notificationRef}
            notification={notification}
            actionUsers={actionUsers}
          />
        )}
      </div>
    </TagElem>
  );
};

export default InAppNotificationElm;
