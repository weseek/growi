import React from 'react';
import PagePath from 'components/PageList/PagePath';
import { Notification } from 'client/types/crowi';
import NotificationItem from '../NotificationItem';

interface Props {
  actionUsers: string
  notification: Notification
  onClick: () => void
}
export const PageCommentNotification = (props: Props) => {

  // render() {
  const notification = props.notification;

  return (
    <NotificationItem {...props} icon="comment">
      <span>
        <b>{props.actionUsers}</b> commented on <PagePath page={notification.target} />
      </span>
    </NotificationItem>
  );
  // }

};
