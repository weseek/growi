import React, {
  forwardRef, ForwardRefRenderFunction,
} from 'react';

import type { IPage, HasObjectId } from '@growi/core';
import { useRouter } from 'next/router';

import type { IInAppNotificationOpenable } from '~/client/interfaces/in-app-notification-openable';
import type { IInAppNotification } from '~/interfaces/in-app-notification';
import * as pageSerializers from '~/models/serializers/in-app-notification-snapshot/page';

import { ModelNotification } from './ModelNotification';
import { useActionMsgAndIconForPageModelNotification } from './useActionAndMsg';


interface Props {
  notification: IInAppNotification<IPage> & HasObjectId
}

const PageModelNotification: ForwardRefRenderFunction<IInAppNotificationOpenable, Props> = (props: Props, ref) => {

  const { notification } = props;

  const { actionMsg, actionIcon } = useActionMsgAndIconForPageModelNotification(notification);

  const router = useRouter();

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

  const actionUsers = getActionUsers();

  // publish open()
  const publishOpen = () => {
    if (notification.target != null) {
      // jump to target page
      const targetPagePath = notification.target.path;
      if (targetPagePath != null) {
        router.push(targetPagePath);
      }
    }
  };

  notification.parsedSnapshot = pageSerializers.parseSnapshot(notification.snapshot);

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

export default forwardRef(PageModelNotification);
