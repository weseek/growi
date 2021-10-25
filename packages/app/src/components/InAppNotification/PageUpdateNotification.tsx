import React from 'react';
import { InAppNotification as IInAppNotification } from '../../interfaces/in-app-notification';

import FormattedDistanceDate from '../FormattedDistanceDate';

interface Props {
  actionUsers: string
  notification: IInAppNotification
  onClick: () => void
}
export const PageUpdateNotification = (props: Props) => {

  return (
    <>
      <div>
        <b>{props.actionUsers}</b> page updated on {props.notification.target.path}
      </div>
      <i className="fa fa-file-o mr-2" />
      <FormattedDistanceDate id={props.notification._id} date={props.notification.createdAt} isShowTooltip={false} />
    </>
  );

};
