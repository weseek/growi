import React from 'react';

import { UserPicture, PagePathLabel } from '@growi/ui';
import { IInAppNotification } from '../../interfaces/in-app-notification';
import { PageUpdateNotification, PageCommentNotification } from './NotificationContent';
import { apiv3Post } from '../../client/util/apiv3-client';
import FormattedDistanceDate from '../FormattedDistanceDate';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:InAppNotificationElm');


interface Props {
  notification: IInAppNotification
}

const InAppNotificationElm = (props: Props): JSX.Element => {

  const { notification } = props;

  const getActionUsers = () => {
    const latestActionUsers = notification.actionUsers.slice(0, 3);
    const latestUsers = latestActionUsers.map((user) => {
      return `@${user.name}`;
    });

    let actionedUsers = '';
    const latestUsersCount = latestUsers.length;
    if (latestUsersCount === 1) {
      actionedUsers = latestUsers[0];
    }
    else if (notification.actionUsers.length >= 4) {
      actionedUsers = `${latestUsers.slice(0, 2).join(', ')} and ${notification.actionUsers.length - 2} others`;
    }
    else {
      actionedUsers = latestUsers.join(', ');
    }

    return actionedUsers;
  };

  const renderUserPicture = (): JSX.Element => {
    const actionUsers = notification.actionUsers;

    if (actionUsers.length < 1) {
      return <></>;
    }
    if (actionUsers.length === 1) {
      return <UserPicture user={actionUsers[0]} size="md" noTooltip />;
    }
    return (
      <div className="position-relative">
        <UserPicture user={actionUsers[0]} size="md" noTooltip />
        <div className="position-absolute" style={{ top: 10, left: 10 }}>
          <UserPicture user={actionUsers[1]} size="md" noTooltip />
        </div>

      </div>
    );
  };

  const notificationClickHandler = async(notification: IInAppNotification) => {

    try {
      // set notification status "STATUS_OPEND"
      await apiv3Post('/in-app-notification/open', { id: notification._id });

      // jump to target page
      window.location.href = notification.target.path;
    }
    catch (err) {
      logger.error(err);
    }
  };

  const renderNotificationMessage = (): JSX.Element => {
    const actionUsers = getActionUsers();
    const pagePath = notification.target.path;


    return (
      <div onClick={() => notificationClickHandler(notification)}>
        <div>
          <b>{actionUsers}</b> page updated on <PagePathLabel page={pagePath} />
        </div>
        <i className="fa fa-file-o mr-2" />
        <FormattedDistanceDate id={props.notification._id} date={props.notification.createdAt} isShowTooltip={false} />
      </div>
    );
  };


  const renderInAppNotificationContent = (): JSX.Element => {
    const propsNew = {
      actionUsers: getActionUsers(),
      ...props,
    };
    const action: string = notification.action;
    switch (action) {
      case 'PAGE_UPDATE':
        return <PageUpdateNotification {...propsNew} />;
      case 'COMMENT_CREATE':
        return <PageCommentNotification {...propsNew} />;
      default:
        return <></>;
    }
  };


  return (
    <>
      <div className="dropdown-item d-flex flex-row mb-3">
        <div className="p-2 mr-2 d-flex align-items-center">
          {renderUserPicture()}
        </div>
        <div className="p-2">
          {renderNotificationMessage()}
        </div>
      </div>
    </>
  );
};

export default InAppNotificationElm;
