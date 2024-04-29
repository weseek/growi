import type {
  IPage, IUser, Ref,
} from '@growi/core';

import { SupportedTargetModel } from '~/interfaces/activity';

import type { ActivityDocument } from '../models/activity';
import Subscription from '../models/subscription';
import { getModelSafely } from '../util/mongoose-utils';

export type PreNotifyProps = {
  notificationTargetUsers?: Ref<IUser>[],
}

export type PreNotify = (props: PreNotifyProps) => Promise<void>;
export type GeneratePreNotify = (activity: ActivityDocument, getAdditionalTargetUsers?: (activity?: ActivityDocument) => Ref<IUser>[]) => PreNotify;

export type GetAdditionalTargetUsers = (activity: ActivityDocument) => Ref<IUser>[];

interface IPreNotifyService {
  generateInitialPreNotifyProps: (PreNotifyProps) => { notificationTargetUsers?: Ref<IUser>[] },
  generatePreNotify: GeneratePreNotify
}

class PreNotifyService implements IPreNotifyService {

  generateInitialPreNotifyProps = (): PreNotifyProps => {

    const initialPreNotifyProps: Ref<IUser>[] = [];

    return { notificationTargetUsers: initialPreNotifyProps };
  };

  generatePreNotify = (activity: ActivityDocument, getAdditionalTargetUsers?: GetAdditionalTargetUsers): PreNotify => {

    const preNotify = async(props: PreNotifyProps) => {
      const { notificationTargetUsers } = props;

      const User = getModelSafely('User') || require('~/server/models/user')();
      const actionUser = activity.user;
      const target = activity.target;
      const subscribedUsers = await Subscription.getSubscription(target as unknown as Ref<IPage>);
      // If target model is PageBulkExportJob, notify the user who started the job. Otherwise, exclude the activity user from the notification.
      const notificationUsers = activity.targetModel === SupportedTargetModel.MODEL_PAGE_BULK_EXPORT_JOB ? subscribedUsers
        : subscribedUsers.filter(item => (item.toString() !== actionUser._id.toString()));
      const activeNotificationUsers = await User.find({
        _id: { $in: notificationUsers },
        status: User.STATUS_ACTIVE,
      }).distinct('_id');

      if (getAdditionalTargetUsers == null) {
        notificationTargetUsers?.push(...activeNotificationUsers);
      }
      else {
        const AdditionalTargetUsers = getAdditionalTargetUsers(activity);

        notificationTargetUsers?.push(
          ...activeNotificationUsers,
          ...AdditionalTargetUsers,
        );
      }

    };

    return preNotify;
  };

}

export const preNotifyService = new PreNotifyService();
