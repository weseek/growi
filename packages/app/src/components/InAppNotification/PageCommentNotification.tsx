import React from 'react';
import { InAppNotification as IInAppNotification } from '../../interfaces/in-app-notification';
// import PagePath from 'components/PageList/PagePath';

interface Props {
  actionUsers: string
  notification: IInAppNotification
  onClick: () => void
}
export const PageCommentNotification = (props: Props) => {

  return (
    <>
      <b>{props.actionUsers}</b> commented on {props.notification.target.path}
    </>
  );

};
