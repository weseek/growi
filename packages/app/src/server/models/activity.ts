import {
  Types, Document, Model, Schema,
} from 'mongoose';

import loggerFactory from '../../utils/logger';

import { getOrCreateModel, getModelSafely } from '../util/mongoose-utils';

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


activitySchema.methods.getNotificationTargetUsers = async function() {
  const User = getModelSafely('User') || require('~/server/models/user')();
  const { user: actionUser, targetModel, target } = this;

  const model: any = await this.model(targetModel).findById(target);
  const [targetUsers, subscribeUsers, unsubscribeUsers] = await Promise.all([
    model.getNotificationTargetUsers(),
    Subscription.getSubscription((target as any) as Types.ObjectId),
    Subscription.getUnsubscription((target as any) as Types.ObjectId),
  ]);

  const unique = array => Object.values(array.reduce((objects, object) => ({ ...objects, [object.toString()]: object }), {}));
  const filter = (array, pull) => {
    const ids = pull.map(object => object.toString());
    return array.filter(object => !ids.includes(object.toString()));
  };
  const notificationUsers = filter(unique([...targetUsers, ...subscribeUsers]), [...unsubscribeUsers, actionUser]);
  const activeNotificationUsers = await User.find({
    _id: { $in: notificationUsers },
    status: User.STATUS_ACTIVE,
  }).distinct('_id');
  return activeNotificationUsers;
};

activitySchema.statics.getActionUsersFromActivities = function(activities) {
  return activities.map(({ user }) => user).filter((user, i, self) => self.indexOf(user) === i);
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

activitySchema.statics.getActionUsersFromActivities = function(activities: ActivityDocument[]): any[] {
  const actionUsers = activities.map((activity) => { return activity.user });

  return actionUsers;
};

export default getOrCreateModel<ActivityDocument, ActivityModel>('Activity', activitySchema);
