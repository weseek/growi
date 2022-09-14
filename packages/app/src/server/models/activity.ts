import { Ref, IPage } from '@growi/core';
import {
  Types, Document, Model, Schema,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import {
  IActivity, ISnapshot, AllSupportedActions, SupportedActionType,
  AllSupportedTargetModels, SupportedTargetModelType,
  AllSupportedEventModels, SupportedEventModelType,
} from '~/interfaces/activity';

import loggerFactory from '../../utils/logger';
import { getOrCreateModel, getModelSafely } from '../util/mongoose-utils';


import Subscription from './subscription';


const logger = loggerFactory('growi:models:activity');

export interface ActivityDocument extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  ip: string
  endpoint: string
  targetModel: SupportedTargetModelType
  target: Types.ObjectId
  eventModel: SupportedEventModelType
  event: Types.ObjectId
  action: SupportedActionType
  snapshot: ISnapshot

  getNotificationTargetUsers(): Promise<any[]>
}

export interface ActivityModel extends Model<ActivityDocument> {
  [x:string]: any
  getActionUsersFromActivities(activities: ActivityDocument[]): any[]
}

const snapshotSchema = new Schema<ISnapshot>({
  username: { type: String, index: true },
});

// TODO: add revision id
const activitySchema = new Schema<ActivityDocument, ActivityModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  ip: {
    type: String,
  },
  endpoint: {
    type: String,
  },
  targetModel: {
    type: String,
    enum: AllSupportedTargetModels,
  },
  target: {
    type: Schema.Types.ObjectId,
    refPath: 'targetModel',
  },
  eventModel: {
    type: String,
    enum: AllSupportedEventModels,
  },
  event: {
    type: Schema.Types.ObjectId,
  },
  action: {
    type: String,
    enum: AllSupportedActions,
    required: true,
  },
  snapshot: snapshotSchema,
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
});
activitySchema.index({ target: 1, action: 1 });
activitySchema.index({
  user: 1, target: 1, action: 1, createdAt: 1,
}, { unique: true });
activitySchema.plugin(mongoosePaginate);

activitySchema.post('save', function() {
  logger.debug('activity has been created', this);
});

activitySchema.methods.getNotificationTargetUsers = async function() {
  const User = getModelSafely('User') || require('~/server/models/user')();
  const { user: actionUser, target } = this;
  const subscribedUsers = await Subscription.getSubscription(target as unknown as Ref<IPage>);
  const notificationUsers = subscribedUsers.filter(item => (item.toString() !== actionUser._id.toString()));
  const activeNotificationUsers = await User.find({
    _id: { $in: notificationUsers },
    status: User.STATUS_ACTIVE,
  }).distinct('_id');
  return activeNotificationUsers;
};

activitySchema.statics.createByParameters = async function(parameters): Promise<IActivity> {
  const activity = await this.create(parameters) as unknown as IActivity;

  return activity;
};

// When using this method, ensure that activity updates are allowed using ActivityService.shoudUpdateActivity
activitySchema.statics.updateByParameters = async function(activityId: string, parameters): Promise<IActivity> {
  const activity = await this.findOneAndUpdate({ _id: activityId }, parameters, { new: true }) as unknown as IActivity;

  return activity;
};

activitySchema.statics.findSnapshotUsernamesByUsernameRegexWithTotalCount = async function(
    q: string, option: { sortOpt: number | string, offset: number, limit: number},
): Promise<{usernames: string[], totalCount: number}> {
  const opt = option || {};
  const sortOpt = opt.sortOpt || 1;
  const offset = opt.offset || 0;
  const limit = opt.limit || 10;

  const conditions = { 'snapshot.username': { $regex: q, $options: 'i' } };

  const usernames = await this.aggregate()
    .skip(0)
    .limit(10000) // Narrow down the search target
    .match(conditions)
    .group({ _id: '$snapshot.username' })
    .sort({ _id: sortOpt }) // Sort "snapshot.username" in ascending order
    .skip(offset)
    .limit(limit);

  const totalCount = (await this.find(conditions).distinct('snapshot.username')).length;

  return { usernames: usernames.map(r => r._id), totalCount };
};

export default getOrCreateModel<ActivityDocument, ActivityModel>('Activity', activitySchema);
