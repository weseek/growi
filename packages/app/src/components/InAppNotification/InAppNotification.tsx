import React from 'react';
// import UserPicture from '../User/UserPicture'

import { PageCommentNotification } from './PageCommentNotification';
// import PageLikeNotification from './ModelAction/PageLikeNotification'

// import { Notification as NotificationType } from 'client/types/crowi'
import { InAppNotification as InAppNotificationType } from '../../interfaces/in-app-notification-types';

interface Props {
  // notification: NotificationType
  notification: InAppNotificationType
  // onClick: Function
  onClick: any
}

// export default class InAppNotification extends React.Component<Props> {
export const InAppNotification = (props: Props): JSX.Element => {

  // onClick() {
  //   props.onClick(props.notification);
  // }
  const { notification } = props;

  const getActionUsers = () => {
    const latestActionUsers = notification.actionUsers.slice(0, 3);
    const latestUsers = latestActionUsers.map((user) => {
      return `@${user}`;
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

  // TODO show user image by #78702
  const getUserImage = () => {
    // const latestActionUsers = props.notification.actionUsers.slice(0, 3);

    // if (latestActionUsers.length < 1) {
    // what is this case?
    //   return '';
    // }

    // return <UserPicture user={latestActionUsers[0]} />;
    return;
  };

  const componentName = `${notification.targetModel}:${notification.action}`;
  const propsNew = {
    actionUsers: getActionUsers(),
    ...props,
  };

  switch (componentName) {
    case 'Page:COMMENT':
      return <PageCommentNotification {...propsNew} onClick={props.onClick} />;
    default:
      return <>InAppNotification</>;
  }
};
