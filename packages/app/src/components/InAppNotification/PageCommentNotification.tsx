import React from 'react';
import { InAppNotification as IInAppNotification } from '../../interfaces/in-app-notification';
// import PagePath from 'components/PageList/PagePath';

interface Props {
  actionUsers: string
  notification: IInAppNotification
  onClick: () => void
}
export const PageCommentNotification = (props: Props) => {
  console.log('propsHOge', props);


  return (
    <span>
      {/* TODO: show page path by #78706 */}
      <b>{props.actionUsers}</b> commented on {props.notification.target}
      {/* <PagePath page={notification.target} /> */}
    </span>
  );

};
