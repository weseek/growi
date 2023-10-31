import React, {
  forwardRef, ForwardRefRenderFunction,
} from 'react';

import type { HasObjectId } from '@growi/core';
import { useRouter } from 'next/router';

import type { IInAppNotificationOpenable } from '~/client/interfaces/in-app-notification-openable';
import type { IInAppNotification } from '~/interfaces/in-app-notification';

import { ModelNotification } from './ModelNotification';
import { useActionMsgAndIconForUserModelNotification } from './useActionAndMsg';


const UserModelNotification: ForwardRefRenderFunction<IInAppNotificationOpenable, {
  notification: IInAppNotification & HasObjectId
  actionUsers: string
}> = ({
  notification, actionUsers,
}, ref) => {
  const router = useRouter();

  const { actionMsg, actionIcon } = useActionMsgAndIconForUserModelNotification(notification);

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
