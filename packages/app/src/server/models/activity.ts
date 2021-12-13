import {
  Types, Document, Model, Schema,
} from 'mongoose';

import { getOrCreateModel, getModelSafely } from '@growi/core';
import loggerFactory from '../../utils/logger';


import ActivityDefine from '../util/activityDefine';
import activityEvent from '../events/activity';

import Subscription from './subscription';

const logger = loggerFactory('growi:models:activity');


export interface ActivityDocument extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId | any
  targetModel: string
  target: string
  action: string
  event: Types.ObjectId
  eventModel: string
  createdAt: Date

  getNotificationTargetUsers(): Promise<any[]>
}

export interface ActivityModel extends Model<ActivityDocument> {
  getActionUsersFromActivities(activities: ActivityDocument[]): any[]
}
// TODO: add revision id
const activitySchema = new Schema<ActivityDocument, ActivityModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    require: true,
  },
  targetModel: {
    type: String,
    require: true,
    enum: ActivityDefine.getSupportTargetModelNames(),
  },
  target: {
    type: Schema.Types.ObjectId,
    refPath: 'targetModel',
    require: true,
  },
  action: {
    type: String,
    require: true,
    enum: ActivityDefine.getSupportActionNames(),
  },
  event: {
    type: Schema.Types.ObjectId,
    refPath: 'eventModel',
  },
  eventModel: {
    type: String,
    enum: ActivityDefine.getSupportEventModelNames(),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
activitySchema.index({ target: 1, action: 1 });
activitySchema.index({
  user: 1, target: 1, action: 1, createdAt: 1,
}, { unique: true });


activitySchema.methods.getNotificationTargetUsers = async function(fromPageDescendants: Array<Types.ObjectId> = []) {
  const User = getModelSafely('User') || require('~/server/models/user')();
  const {
    user: actionUser, targetModel, target, user,
  } = this;

  // const [subscribeUsers, unsubscribeUsers] = await Promise.all([
  //   Subscription.getSubscription((target as any) as Types.ObjectId),
  //   Subscription.getUnsubscription((target as any) as Types.ObjectId),
  // ]);

  const [subscribeUsers] = await Promise.all([
    Subscription.getSubscription((target as any) as Types.ObjectId),
  ]);

  console.log('subscribeUsers', subscribeUsers);
  // console.log('unsubscribeUsers', unsubscribeUsers);

  // eslint-disable-next-line prefer-const
  // let descendantsPageSubscribeUsers: Array<Types.ObjectId> = [];

  // if (isRecursively && targetModel === 'Page') {
  //   const Page = getModelSafely('Page') || require('~/server/models/page')();
  //   const fromPageDescendants = await Page.findManageableListWithDescendants(target, user);
  //   const targetPageId = (target as any)._id;

  //   for (const page of fromPageDescendants) {
  //     console.log(page);
  //     // eslint-disable-next-line eqeqeq
  //     if (page._id.toString() != targetPageId) {
  //       // eslint-disable-next-line  no-await-in-loop
  //       const subscribeUsers = await Subscription.getSubscription((page as any) as Types.ObjectId);
  //       subscribeUsers.forEach((user) => {
  //         // eslint-disable-next-line eqeqeq
  //         if (actionUser.toString() != user.toString()) {
  //           descendantsPageSubscribeUsers.push(user);
  //         }
  //       });
  //     }
  //   }
  // }

  const unique = array => Object.values(array.reduce((objects, object) => ({ ...objects, [object.toString()]: object }), {}));
  const filter = (array, pull) => {
    const ids = pull.map(object => object.toString());
    console.log('array', array);
    console.log('ids', ids);
    return array.filter(object => !ids.includes(object.toString()));
  };

  // eslint-disable-next-line prefer-const
  let descendantPageUsers: Array<Types.ObjectId> = [];
  if (fromPageDescendants.length > 0) {
    for (const page of fromPageDescendants) {
      // eslint-disable-next-line  no-await-in-loop
      const subscribeUsers = await Subscription.getSubscription((page as any) as Types.ObjectId);
      subscribeUsers.forEach(user => descendantPageUsers.push(user));
    }
  }
  console.log('descendantPageUsers', descendantPageUsers);

  const notificationUsers = filter(unique([...subscribeUsers, ...descendantPageUsers]), [actionUser]);

  console.log('notificationUsers', notificationUsers);

  // if (fromPageDescendants.length > 0) {
  //   const targetPage = (target as any) as IPage;
  //   fromPageDescendants.forEach(async(page) => {
  //     const descendantsPage = (page as any) as IPage;
  //     // eslint-disable-next-line eqeqeq
  //     if (descendantsPage._id != targetPage._id) {
  //       console.log('子');
  //       // eslint-disable-next-line  no-await-in-loop
  //       const subscribeUsers = await Subscription.getSubscription((page as any) as Types.ObjectId);
  //       subscribeUsers.forEach((user) => {
  //         // eslint-disable-next-line eqeqeq
  //         const isAbleToPush = actionUser.toString() != user.toString() && !notificationUsers.includes(user._id);
  //         if (isAbleToPush) {
  //           notificationUsers.push(user);
  //         }
  //       });
  //     }
  //     else {
  //       console.og('親');
  //     }
  //   });
  // }

  const activeNotificationUsers = await User.find({
    _id: { $in: notificationUsers },
    status: User.STATUS_ACTIVE,
  }).distinct('_id');
  return activeNotificationUsers;
};

activitySchema.post('save', async(savedActivity: ActivityDocument) => {
  let targetUsers: Types.ObjectId[] = [];
  try {
    targetUsers = await savedActivity.getNotificationTargetUsers();
  }
  catch (err) {
    logger.error(err);
  }

  activityEvent.emit('create', targetUsers, savedActivity);
});

export default getOrCreateModel<ActivityDocument, ActivityModel>('Activity', activitySchema);
