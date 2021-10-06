import React from 'react';
// import PagePath from 'components/PageList/PagePath';
import { InAppNotification as InAppNotificationType } from '../../interfaces/in-app-notification-types';
// import NotificationItem from '../NotificationItem';

interface Props {
  actionUsers: string
  notification: InAppNotificationType
  onClick: () => void
}
export const PageCommentNotification = (props: Props) => {
  console.log('propsHOge', props);


  return (
    <span>
      <b>{props.actionUsers}</b> commented on {props.notification.target}
      {/* <PagePath page={notification.target} /> */}
    </span>
  );

};
