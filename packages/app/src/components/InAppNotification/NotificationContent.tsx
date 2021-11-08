import React from 'react';
import { PagePathLabel } from '@growi/ui';
import { IInAppNotification } from '../../interfaces/in-app-notification';
import loggerFactory from '~/utils/logger';

import FormattedDistanceDate from '../FormattedDistanceDate';

const logger = loggerFactory('growi:NotificationContent');

interface Props {
  actionUsers: string
  notification: IInAppNotification
}

// const notificationClickHandler = async(notification: IInAppNotification) => {
const notificationClickHandler = async(pagePath: string) => {

  try {
    // TODO: change notification status read by #80904
    // await this.props.crowi.apiPost('/notification.open', { id: notification._id });
    // jump to target page
    window.location.href = pagePath;
  }
  catch (err) {
    logger.error(err);
  }
};

export const PageCommentNotification = (props: Props): JSX.Element => {

  const pagePath = { path: props.notification.target.path };

  return (
    <div onClick={() => notificationClickHandler(pagePath.path)}>
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
    <div onClick={() => notificationClickHandler(pagePath.path)}>
      <div>
        <b>{props.actionUsers}</b> page updated on <PagePathLabel page={pagePath} />
      </div>
      <i className="fa fa-file-o mr-2" />
      <FormattedDistanceDate id={props.notification._id} date={props.notification.createdAt} isShowTooltip={false} />
    </div>
  );
};
