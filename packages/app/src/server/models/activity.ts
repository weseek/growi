import { getOrCreateModel, getModelSafely } from '@growi/core';
import {
  Types, Document, Model, Schema,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { AllSupportedTargetModelType, AllSupportedEventModelType, AllSupportedActionType } from '~/interfaces/activity';

import loggerFactory from '../../utils/logger';
import activityEvent from '../events/activity';

import Subscription from './subscription';

const logger = loggerFactory('growi:models:activity');

export interface ActivityDocument extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId | any
  targetModel: string
  target: Types.ObjectId
  action: string
  event: Types.ObjectId
  eventModel: string

  getNotificationTargetUsers(): Promise<any[]>
}

export interface ActivityModel extends Model<ActivityDocument> {
  [x:string]: any
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
    enum: AllSupportedTargetModelType,
  },
  target: {
    type: Schema.Types.ObjectId,
    refPath: 'targetModel',
    require: true,
  },
  action: {
    type: String,
    require: true,
    enum: AllSupportedActionType,
  },
  event: {
    type: Schema.Types.ObjectId,
    refPath: 'eventModel',
  },
  eventModel: {
    type: String,
    enum: AllSupportedEventModelType,
  },
}, {
  timestamps: true,
});
activitySchema.index({ target: 1, action: 1 });
activitySchema.index({
  user: 1, target: 1, action: 1, createdAt: 1,
}, { unique: true });
activitySchema.plugin(mongoosePaginate);


activitySchema.methods.getNotificationTargetUsers = async function() {
  const User = getModelSafely('User') || require('~/server/models/user')();
  const { user: actionUser, target } = this;

  const [subscribeUsers, unsubscribeUsers] = await Promise.all([
    Subscription.getSubscription((target as any) as Types.ObjectId),
    Subscription.getUnsubscription((target as any) as Types.ObjectId),
  ]);

  const unique = array => Object.values(array.reduce((objects, object) => ({ ...objects, [object.toString()]: object }), {}));
  const filter = (array, pull) => {
    const ids = pull.map(object => object.toString());
    return array.filter(object => !ids.includes(object.toString()));
  };
  const notificationUsers = filter(unique([...subscribeUsers]), [...unsubscribeUsers, actionUser]);
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

activitySchema.statics.getPaginatedActivity = async function(limit: number, offset: number) {
  const paginateResult = await this.paginate(
    {},
    {
      limit,
      offset,
      sort: { createdAt: -1 },
      populate: 'user',
    },
  );
  return paginateResult;
};

export default getOrCreateModel<ActivityDocument, ActivityModel>('Activity', activitySchema);
