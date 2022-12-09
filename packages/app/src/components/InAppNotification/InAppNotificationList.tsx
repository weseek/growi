import React, { FC } from 'react';

import { HasObjectId } from '@growi/core';

import type { IInAppNotification, PaginateResult } from '~/interfaces/in-app-notification';

import InAppNotificationElm from './InAppNotificationElm';


type Props = {
  inAppNotificationData?: PaginateResult<IInAppNotification>,
  elemClassName?: string,
  type?: 'button' | 'dropdown-item',
};

const InAppNotificationList: FC<Props> = (props: Props) => {
  const { inAppNotificationData } = props;

  if (inAppNotificationData == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  const notifications = inAppNotificationData.docs.filter((notification) => { return notification.parsedSnapshot != null });

  return (
    <>
      { notifications.map((notification: IInAppNotification & HasObjectId) => {
        return (
          <InAppNotificationElm key={notification._id} notification={notification} type={props.type} elemClassName={props.elemClassName} />
        );
      }) }
    </>
  );
};


export default InAppNotificationList;
