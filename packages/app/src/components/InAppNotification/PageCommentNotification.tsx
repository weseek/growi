import React from 'react';
// import PagePath from 'components/PageList/PagePath';
import { InAppNotification as IInAppNotification } from '../../interfaces/in-app-notification';
// import NotificationItem from '../NotificationItem';

interface Props {
  actionUsers: string
  notification: IInAppNotification
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
