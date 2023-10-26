import React, {
  forwardRef, ForwardRefRenderFunction,
} from 'react';

import type { HasObjectId } from '@growi/core';
import { useRouter } from 'next/router';

import type { IInAppNotificationOpenable } from '~/client/interfaces/in-app-notification-openable';
import type { IInAppNotification } from '~/interfaces/in-app-notification';

import { ModelNotification } from './ModelNotification';

interface Props {
  notification: IInAppNotification & HasObjectId
  actionMsg: string
  actionIcon: string
  actionUsers: string
}

const PageModelNotification: ForwardRefRenderFunction<IInAppNotificationOpenable, Props> = (props: Props, ref) => {

  const {
    notification, actionMsg, actionIcon, actionUsers,
  } = props;

  const router = useRouter();

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
