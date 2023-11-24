import { FC } from 'react';

import type { HasObjectId, IPage, IUser } from '@growi/core';
import { useRouter } from 'next/router';


import { SupportedTargetModel } from '~/interfaces/activity';
import { IInAppNotification } from '~/interfaces/in-app-notification';


import PageModelNotification from './PageModelNotification';
import UserModelNotification from './UserModelNotification';

type ModelNotificationUtils = {
  Notification: FC
  publishOpen: () => void
}

export const useModelNotification = (notification: IInAppNotification & HasObjectId): ModelNotificationUtils => {

  const targetModel = notification.targetModel;

  const router = useRouter();

  let Notification;
  let publishOpen;

  switch (targetModel) {
    case SupportedTargetModel.MODEL_PAGE:

      Notification = () => {
        return <PageModelNotification notification={notification as IInAppNotification<IPage> & HasObjectId} />;
      };

      publishOpen = () => {
        if (notification.target != null) {
          // jump to target page
          const targetPagePath = (notification.target as IPage).path;
          if (targetPagePath != null) {
            router.push(targetPagePath);
          }
        }
      };

      break;

    case SupportedTargetModel.MODEL_USER:

      Notification = () => {
        return <UserModelNotification notification={notification as IInAppNotification<IUser> & HasObjectId} />;
      };

      publishOpen = () => {
        router.push('/admin/users');
      };

      break;
  }

  return {
    Notification,
    publishOpen,
  };

};
