import React, {
  forwardRef, ForwardRefRenderFunction,
} from 'react';

import type { HasObjectId } from '@growi/core';
import { useRouter } from 'next/router';

import type { IInAppNotificationOpenable } from '~/client/interfaces/in-app-notification-openable';
import type { IInAppNotification } from '~/interfaces/in-app-notification';

import { ModelNotification } from './ModelNotification';
import type { ActionMsgAndIconType } from './PageModelNotification';

const useActionMsgAndIcon = (notification: IInAppNotification & HasObjectId): ActionMsgAndIconType => {
  const actionType: string = notification.action;
  let actionMsg: string;
  let actionIcon: string;

  switch (actionType) {
    case 'USER_REGISTRATION_APPROVAL_REQUEST':
      actionMsg = 'requested registration approval';
      actionIcon = 'icon-bubble';
      break;
    default:
      actionMsg = '';
      actionIcon = '';
  }

  return {
    actionMsg,
    actionIcon,
  };
};

const UserModelNotification: ForwardRefRenderFunction<IInAppNotificationOpenable, {
  notification: IInAppNotification & HasObjectId
  actionUsers: string
}> = ({
  notification, actionUsers,
}, ref) => {
  const router = useRouter();

  const { actionMsg, actionIcon } = useActionMsgAndIcon(notification);

  // publish open()
  const publishOpen = () => {
    router.push('/admin/users');
  };

  return (
    <ModelNotification
      notification={notification}
      actionMsg={actionMsg}
      actionIcon={actionIcon}
      actionUsers={actionUsers}
      publishOpen={publishOpen}
      ref={ref}
    />
  );
};

export default forwardRef(UserModelNotification);
