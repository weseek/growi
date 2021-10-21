import React from 'react';

import { UserPicture } from '@growi/ui';
import { PageCommentNotification } from './PageCommentNotification';
import { InAppNotification as IInAppNotification } from '../../interfaces/in-app-notification';
import FormattedDistanceDate from '../FormattedDistanceDate';

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

  const renderUserImage = () => {
    const actionUsers = notification.actionUsers;

    if (actionUsers.length < 1) {
    // what is this case?
      return '';
    }

    return <UserPicture user={actionUsers[0]} size="md" noTooltip />;
  };

  const componentName = `${notification.targetModel}:${notification.action}`;
  const propsNew = {
    actionUsers: getActionUsers(),
    ...props,
  };

  switch (componentName) {
    case 'Page:COMMENT':
      return (
        <>
          <div>
            {renderUserImage()}
            <PageCommentNotification {...propsNew} onClick={props.onClick(props.notification)} />
          </div>
          <FormattedDistanceDate id={props.notification._id} date={props.notification.createdAt} isShowTooltip={false} />
        </>

      );
    default:
      return <></>;
  }
};
