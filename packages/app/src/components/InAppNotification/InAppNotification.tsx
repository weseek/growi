import React from 'react';

import { UserPicture } from '@growi/ui';
import { IInAppNotification } from '../../interfaces/in-app-notification';
import { PageUpdateNotification, PageCommentNotification } from './NotificationContent';

interface Props {
  notification: IInAppNotification
  onClick: any
}

export const InAppNotification = (props: Props): JSX.Element => {

  const { notification } = props;

  // TODO get actionUsers with mongoose virtual method by #79077
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

  const renderUserPicture = (): JSX.Element => {
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

  const componentName = `${notification.targetModel}:${notification.action}`;
  const propsNew = {
    actionUsers: getActionUsers(),
    ...props,
  };

  const renderInAppNotificationContent = (): JSX.Element => {
    switch (componentName) {
      // TODO Is the naming of componentName too subtle?
      case 'Page:UPDATE':
        return <PageUpdateNotification {...propsNew} onClick={props.onClick(props.notification)} />;
      case 'Page:COMMENT':
        return <PageCommentNotification {...propsNew} onClick={props.onClick(props.notification)} />;
      default:
        return <></>;
    }
  };

  return (
    <>
      <div className="dropdown-item d-flex flex-row mb-3">
        <div className="p-2 mr-2 d-flex align-items-center">
          {renderUserPicture()}
        </div>
        <div className="p-2">
          {renderInAppNotificationContent()}
        </div>
      </div>
    </>
  );
};
