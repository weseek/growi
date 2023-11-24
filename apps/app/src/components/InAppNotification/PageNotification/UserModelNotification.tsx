import React, {
  forwardRef, ForwardRefRenderFunction,
} from 'react';

import type { IUser, HasObjectId } from '@growi/core';

import type { IInAppNotificationOpenable } from '~/client/interfaces/in-app-notification-openable';
import type { IInAppNotification } from '~/interfaces/in-app-notification';

import { ModelNotification } from './ModelNotification';
import { useActionMsgAndIconForUserModelNotification } from './useActionAndMsg';

interface Props {
  notification: IInAppNotification<IUser> & HasObjectId
}

const UserModelNotification: ForwardRefRenderFunction<IInAppNotificationOpenable, Props> = (props: Props) => {

  const { notification } = props;

  const { actionMsg, actionIcon } = useActionMsgAndIconForUserModelNotification(notification);

  const actionUsers = notification.target.username;

  return (
    <ModelNotification
      notification={notification}
      actionMsg={actionMsg}
      actionIcon={actionIcon}
      actionUsers={actionUsers}
    />
  );
};

export default forwardRef(UserModelNotification);
