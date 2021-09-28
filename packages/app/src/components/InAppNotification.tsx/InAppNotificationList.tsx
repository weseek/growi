import React from 'react';
// import UserPicture from '../User/UserPicture'

// import PageCommentNotification from './ModelAction/PageCommentNotification'
// import PageLikeNotification from './ModelAction/PageLikeNotification'

// import { Notification as NotificationType } from 'client/types/crowi'

interface Props {
  // notification: NotificationType
  notification: any
  // onClick: Function
  onClick: any
}

export default class InAppNotificationList extends React.Component<Props> {

  onClick() {
    this.props.onClick(this.props.notification);
  }

  getActionUsers() {
    const notification = this.props.notification;
    const latestActionUsers = notification.actionUsers.slice(0, 3);
    const latestUsers = latestActionUsers.map((user) => {
      return `@${user.username}`;
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
  }

  getUserImage() {
    const latestActionUsers = this.props.notification.actionUsers.slice(0, 3);

    if (latestActionUsers.length < 1) {
      // what is this case?
      return '';
    }

    // return <UserPicture user={latestActionUsers[0]} />;
    return;
  }

  render() {
    const notification = this.props.notification;
    const componentName = `${notification.targetModel}:${notification.action}`;
    const props = {
      actionUsers: this.getActionUsers(),
      ...this.props,
    };

    switch (componentName) {
      case 'Page:COMMENT':
        // return <PageCommentNotification {...props} onClick={this.onClick.bind(this)} />;
        return;
      case 'Page:LIKE':
        // return <PageLikeNotification {...props} onClick={this.onClick.bind(this)} />
        return;
      default:
    }

    return '';
  }

}
