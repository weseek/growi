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
export type GeneratePreNotify = (activity: ActivityDocument, getAditionalTargetUsers?: (activity?: ActivityDocument) => Ref<IUser>[]) => PreNotify;

export type GetAditionalTargetUsers = (activity: ActivityDocument) => Ref<IUser>[];

export const generateInitialPreNotifyProps = (): PreNotifyProps => {

  const initialPreNotifyProps: Ref<IUser>[] = [];

  return { notificationTargetUsers: initialPreNotifyProps };
};

export const generatePreNotify = (activity: ActivityDocument, getAditionalTargetUsers?: GetAditionalTargetUsers): PreNotify => {

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

    if (getAditionalTargetUsers == null) {
      notificationTargetUsers?.push(...activeNotificationUsers);
    }
    else {
      const aditionalTargetUsers = getAditionalTargetUsers(activity);

      notificationTargetUsers?.push(
        ...activeNotificationUsers,
        ...aditionalTargetUsers,
      );
    }

  };

  return preNotify;
};

// export const generateDefaultPreNotify = (activity: ActivityDocument): PreNotify => {

//   const preNotify = async(props: PreNotifyProps) => {
//     const { notificationTargetUsers } = props;

//     const User = getModelSafely('User') || require('~/server/models/user')();
//     const actionUser = activity.user;
//     const target = activity.target;
//     const subscribedUsers = await Subscription.getSubscription(target as unknown as Ref<IPage>);
//     const notificationUsers = subscribedUsers.filter(item => (item.toString() !== actionUser._id.toString()));
//     const activeNotificationUsers = await User.find({
//       _id: { $in: notificationUsers },
//       status: User.STATUS_ACTIVE,
//     }).distinct('_id');

//     notificationTargetUsers?.push(...activeNotificationUsers);
//   };

//   return preNotify;
// };

// export const generatePreNotifyAlsoDescendants = (activity: ActivityDocument, descendantsSubscribedUsers: Ref<IUser>[]): PreNotify => {

//   const preNotify = async(props: PreNotifyProps) => {
//     const { notificationTargetUsers } = props;

//     const User = getModelSafely('User') || require('~/server/models/user')();
//     const actionUser = activity.user;
//     const target = activity.target;
//     const subscribedUsers = await Subscription.getSubscription(target as unknown as Ref<IPage>);
//     const notificationUsers = subscribedUsers.filter(item => (item.toString() !== actionUser._id.toString()));
//     const activeNotificationUsers = await User.find({
//       _id: { $in: notificationUsers },
//       status: User.STATUS_ACTIVE,
//     }).distinct('_id');

//     notificationTargetUsers?.push(
//       ...activeNotificationUsers,
//       ...descendantsSubscribedUsers,
//     );

//   };

//   return preNotify;
// };
