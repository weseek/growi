import React from 'react';
import { PagePathLabel } from '@growi/ui';
import { IInAppNotification } from '../../interfaces/in-app-notification';

import FormattedDistanceDate from '../FormattedDistanceDate';

interface Props {
  actionUsers: string
  notification: IInAppNotification
  onClick: () => void
}

export const PageCommentNotification = (props: Props): JSX.Element => {

  const pagePath = { path: props.notification.target.path };

  return (
    <>
      <div>
        <b>{props.actionUsers}</b> commented on  <PagePathLabel page={pagePath} />
      </div>
      <i className="fa fa-comment-o mr-2" />
      <FormattedDistanceDate id={props.notification._id} date={props.notification.createdAt} isShowTooltip={false} />
    </>
  );
};

export const PageUpdateNotification = (props: Props): JSX.Element => {

  const pagePath = { path: props.notification.target.path };

  return (
    <>
      <div>
        <b>{props.actionUsers}</b> page updated on <PagePathLabel page={pagePath} />
      </div>
      <i className="fa fa-file-o mr-2" />
      <FormattedDistanceDate id={props.notification._id} date={props.notification.createdAt} isShowTooltip={false} />
    </>
  );
};
