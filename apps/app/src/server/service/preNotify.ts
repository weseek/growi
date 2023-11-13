import type { IPage, IUser, Ref } from '@growi/core';

import { ActivityDocument } from '../models/activity';
import Subscription from '../models/subscription';
import { getModelSafely } from '../util/mongoose-utils';

export type PreNotifyProps = {
  notificationTargetUsers?: IUser[],
}

export type PreNotify = (props: PreNotifyProps) => Promise<void>;

export const generateInitialPreNotifyProps = (): PreNotifyProps => {

  const initialPreNotifyProps: IUser[] = [];

  return { notificationTargetUsers: initialPreNotifyProps };
};

export const generateDefaultPreNotify = (activity: ActivityDocument): PreNotify => {

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

    notificationTargetUsers?.concat(activeNotificationUsers);

  };

  return preNotify;
};

export const generatePreNotifyAlsoDescendants = (activity: ActivityDocument, descendantsSubscribedUsers): PreNotify => {

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

    notificationTargetUsers?.concat(
      activeNotificationUsers,
      descendantsSubscribedUsers as IUser[],
    );

  };

  return preNotify;
};
