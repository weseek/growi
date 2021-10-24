import React from 'react';
import { InAppNotification as IInAppNotification } from '../../interfaces/in-app-notification';

interface Props {
  actionUsers: string
  notification: IInAppNotification
  onClick: () => void
}
export const PageCommentInAppNotification = (props: Props): JSX.Element => {

  // TODO: need to add page comment create and update statuses.

  return (
    <>
      <b>{props.actionUsers}</b> commented on {props.notification.target.path}
    </>
  );

};
