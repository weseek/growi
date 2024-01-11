import React, { FC } from 'react';

import type { HasObjectId } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components';

import { apiv3Post } from '~/client/util/apiv3-client';
import { IInAppNotification, InAppNotificationStatuses } from '~/interfaces/in-app-notification';

import { useModelNotification } from './PageNotification';

interface Props {
  notification: IInAppNotification & HasObjectId
  elemClassName?: string,
  type?: 'button' | 'list',
}


const InAppNotificationElm: FC<Props> = (props: Props) => {

  const { notification } = props;

  const modelNotificationUtils = useModelNotification(notification);

  const Notification = modelNotificationUtils?.Notification;
  const publishOpen = modelNotificationUtils?.publishOpen;

  if (Notification == null || publishOpen == null) {
    return <></>;
  }

  const clickHandler = async(notification: IInAppNotification & HasObjectId): Promise<void> => {
    if (notification.status === InAppNotificationStatuses.STATUS_UNOPENED) {
      // set notification status "OPEND"
      await apiv3Post('/in-app-notification/open', { id: notification._id });
    }

    publishOpen();
  };

  const renderActionUserPictures = (): JSX.Element => {
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

  const isListItem = props.type === 'list';

  // determine tag
  const TagElem = isListItem
    ? props => (
      <div {...props} style={{ cursor: 'pointer' }}>
        {/* eslint-disable-next-line react/prop-types */}
        {props.children}
        <div className="border-top" />
      </div>
    )
    // eslint-disable-next-line react/prop-types
    : props => <button type="button" {...props}>{props.children}</button>;

  return (
    <TagElem className={props.elemClassName} onClick={() => clickHandler(notification)}>
      <div className="d-flex align-items-center">
        <span
          className={`${notification.status === InAppNotificationStatuses.STATUS_UNOPENED
            ? 'grw-unopend-notification'
            : 'ms-2'
          } rounded-circle me-3`}
        >
        </span>
        {renderActionUserPictures()}

        <Notification />

      </div>
    </TagElem>
  );
};

export default InAppNotificationElm;
