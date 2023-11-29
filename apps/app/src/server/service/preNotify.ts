import type {
  IPage, IUser, Ref,
} from '@growi/core';

import { ActivityDocument } from '../models/activity';
import Subscription from '../models/subscription';
import { getModelSafely } from '../util/mongoose-utils';

export type PreNotifyProps = {
  notificationTargetUsers?: Ref<IUser>[],
}

export type PreNotify = (props: PreNotifyProps) => Promise<void>;
export type GeneratePreNotify = (activity: ActivityDocument, getAdditionalTargetUsers?: (activity?: ActivityDocument) => Ref<IUser>[]) => PreNotify;

export type GetAdditionalTargetUsers = (activity: ActivityDocument) => Ref<IUser>[];

class PreNotifyService {

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
      const notificationUsers = subscribedUsers.filter(item => (item.toString() !== actionUser._id.toString()));
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
