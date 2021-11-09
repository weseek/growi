import React from 'react';
import { PagePathLabel } from '@growi/ui';
import { IInAppNotification } from '../../interfaces/in-app-notification';
import { apiv3Post } from '../../client/util/apiv3-client';
import FormattedDistanceDate from '../FormattedDistanceDate';

interface Props {
  actionUsers: string
  notification: IInAppNotification
}


const notificationClickHandler = async(notification: IInAppNotification) => {
  try {
    await apiv3Post('/in-app-notification/open', { id: notification._id });

    // jump to target page
    // window.location.href = notification.target.path;
  }
  catch (err) {
    // logger.error(err);
  }
};

export const PageCommentNotification = (props: Props): JSX.Element => {

  const pagePath = { path: props.notification.target.path };

  return (
    <div onClick={() => notificationClickHandler(props.notification)}>
      <div>
        <b>{props.actionUsers}</b> commented on  <PagePathLabel page={pagePath} />
      </div>
      <i className="fa fa-comment-o mr-2" />
      <FormattedDistanceDate id={props.notification._id} date={props.notification.createdAt} isShowTooltip={false} />
    </div>
  );
};

export const PageUpdateNotification = (props: Props): JSX.Element => {

  const pagePath = { path: props.notification.target.path };

  return (
    <div onClick={() => notificationClickHandler(props.notification)}>
      <div>
        <b>{props.actionUsers}</b> page updated on <PagePathLabel page={pagePath} />
      </div>
      <i className="fa fa-file-o mr-2" />
      <FormattedDistanceDate id={props.notification._id} date={props.notification.createdAt} isShowTooltip={false} />
    </div>
  );
};
