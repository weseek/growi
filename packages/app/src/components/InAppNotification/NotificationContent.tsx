import React from 'react';
import { InAppNotification as IInAppNotification } from '../../interfaces/in-app-notification';

import FormattedDistanceDate from '../FormattedDistanceDate';

import { PagePath } from './PagePath';

interface Props {
  actionUsers: string
  notification: IInAppNotification
  onClick: () => void
}

export const PageCommentCreatedNotification = (props: Props): JSX.Element => {

  return (
    <>
      <div>
        <b>{props.actionUsers}</b> commented on <PagePath notification={props.notification} />
      </div>
      <i className="fa fa-comment-o mr-2" />
      <FormattedDistanceDate id={props.notification._id} date={props.notification.createdAt} isShowTooltip={false} />
    </>
  );
};

export const PageCommentUpdatedNotification = (props: Props): JSX.Element => {

  return (
    <>
      <div>
        <b>{props.actionUsers}</b> comment updated on <PagePath notification={props.notification} />
      </div>
      <i className="fa fa-comment-o mr-2" />
      <FormattedDistanceDate id={props.notification._id} date={props.notification.createdAt} isShowTooltip={false} />
    </>
  );
};

export const PageUpdatedNotification = (props: Props): JSX.Element => {

  return (
    <>
      <div>
        <b>{props.actionUsers}</b> page updated on <PagePath notification={props.notification} />
      </div>
      <i className="fa fa-file-o mr-2" />
      <FormattedDistanceDate id={props.notification._id} date={props.notification.createdAt} isShowTooltip={false} />
    </>
  );

};
