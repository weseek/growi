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


activitySchema.methods.getNotificationTargetUsers = async function(isRecursively: boolean) {
  const User = getModelSafely('User') || require('~/server/models/user')();
  const {
    user: actionUser, targetModel, target, user,
  } = this;

  const [subscribeUsers, unsubscribeUsers] = await Promise.all([
    Subscription.getSubscription((target as any) as Types.ObjectId),
    Subscription.getUnsubscription((target as any) as Types.ObjectId),
  ]);

  // eslint-disable-next-line prefer-const
  let descendantsPageSubscribeUsers: Array<Types.ObjectId> = [];

  if (isRecursively) {
    const Page = getModelSafely('Page') || require('~/server/models/page')();
    const fromPageDescendants = await Page.findManageableListWithDescendants(target, user);
    const targetPageId = (target as any)._id;

    for (const page of fromPageDescendants) {
      // eslint-disable-next-line eqeqeq
      if (page._id.toString() != targetPageId) {
        // eslint-disable-next-line  no-await-in-loop
        const subscribeUsers = await Subscription.getSubscription((page as any) as Types.ObjectId);
        subscribeUsers.forEach((user) => {
          // eslint-disable-next-line eqeqeq
          if (actionUser.toString() != user.toString()) {
            descendantsPageSubscribeUsers.push(user);
          }
        });
      }
    }
  }

  // /* eslint-disable prefer-const */
  // let subscribeUsers: Array<Types.ObjectId> = [];
  // let unsubscribeUsers: Array<Types.ObjectId> = [];
  // /* eslint-disable prefer-const */

  // if (targetModel === 'Page' && isRecursively) {
  //   const Page = getModelSafely('Page') || require('~/server/models/page')();
  //   const fromPageDescendants = await Page.findManageableListWithDescendants(target, user);
  //   for (const page of fromPageDescendants) {
  //     /* eslint-disable no-await-in-loop */
  //     /* eslint-disable no-loop-func */
  //     (await Subscription.getSubscription((page as any) as Types.ObjectId)).forEach(user => subscribeUsers.push(user));
  //     (await Subscription.getUnsubscription((page as any) as Types.ObjectId)).forEach(user => unsubscribeUsers.push(user));
  //     /* eslint-disable no-await-in-loop */
  //     /* eslint-disable no-loop-func */
  //   }
  // }
  // else {
  //   [subscribeUsers, unsubscribeUsers] = await Promise.all([
  //     Subscription.getSubscription((target as any) as Types.ObjectId),
  //     Subscription.getUnsubscription((target as any) as Types.ObjectId),
  //   ]);
  // }

  const unique = array => Object.values(array.reduce((objects, object) => ({ ...objects, [object.toString()]: object }), {}));
  const filter = (array, pull) => {
    const ids = pull.map(object => object.toString());
    return array.filter(object => !ids.includes(object.toString()));
  };
  const notificationUsers = filter(unique([...subscribeUsers]), [...unsubscribeUsers, actionUser]);

  if (descendantsPageSubscribeUsers.length > 0) {
    unique(descendantsPageSubscribeUsers).forEach(user => notificationUsers.push(user));
  }

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
