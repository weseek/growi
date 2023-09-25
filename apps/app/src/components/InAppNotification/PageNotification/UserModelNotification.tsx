import React, {
  forwardRef, ForwardRefRenderFunction, useImperativeHandle,
} from 'react';

import type { HasObjectId } from '@growi/core';
import { useRouter } from 'next/router';

import type { IInAppNotificationOpenable } from '~/client/interfaces/in-app-notification-openable';
import type { IInAppNotification } from '~/interfaces/in-app-notification';

import FormattedDistanceDate from '../../FormattedDistanceDate';

const UserModelNotification: ForwardRefRenderFunction<IInAppNotificationOpenable, {
  notification: IInAppNotification & HasObjectId
  actionMsg: string
  actionIcon: string
  actionUsers: string
}> = ({
  notification, actionMsg, actionIcon, actionUsers,
}, ref) => {
  const router = useRouter();

  // publish open()
  useImperativeHandle(ref, () => ({
    open() {
      router.push('/admin/users');
    },
  }));

  return (
    <div className="p-2 overflow-hidden">
      <div className="text-truncate">
        <b>{actionUsers}</b> {actionMsg}
      </div>
      <i className={`${actionIcon} me-2`} />
      <FormattedDistanceDate
        id={notification._id}
        date={notification.createdAt}
        isShowTooltip={false}
        differenceForAvoidingFormat={Number.POSITIVE_INFINITY}
      />
    </div>
  );
};

export default forwardRef(UserModelNotification);
