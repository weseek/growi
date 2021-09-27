import {
  Types, Document, Model, Schema,
} from 'mongoose';

import ActivityDefine from '../util/activityDefine';
import { getOrCreateModel } from '../util/mongoose-utils';

const STATUS_WATCH = 'WATCH';
const STATUS_IGNORE = 'IGNORE';
const STATUSES = [STATUS_WATCH, STATUS_IGNORE];

export interface ISubscription {
  user: Types.ObjectId
  targetModel: string
  target: Types.ObjectId
  status: string
  createdAt: Date

  isWatching(): boolean
  isIgnoring(): boolean
}

export interface SubscriptionDocument extends ISubscription, Document {}

export interface SubscriptionModel extends Model<SubscriptionDocument> {
  findByUserIdAndTargetId(userId: Types.ObjectId, targetId: Types.ObjectId): any
  upsertWatcher(user: Types.ObjectId, targetModel: string, target: Types.ObjectId, status: string): any
  watchByPageId(user: Types.ObjectId, pageId: Types.ObjectId, status: string): any
  getWatchers(target: Types.ObjectId): Promise<Types.ObjectId[]>
  getIgnorers(target: Types.ObjectId): Promise<Types.ObjectId[]>
}

const subscriptionSchema = new Schema<SubscriptionDocument, SubscriptionModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
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
  status: {
    type: String,
    require: true,
    enum: STATUSES,
  },
  createdAt: { type: Date, default: Date.now },
});

subscriptionSchema.methods.isWatching = function() {
  return this.status === STATUS_WATCH;
};

subscriptionSchema.methods.isIgnoring = function() {
  return this.status === STATUS_IGNORE;
};

subscriptionSchema.statics.findByUserIdAndTargetId = function(userId, targetId) {
  return this.findOne({ user: userId, target: targetId });
};

subscriptionSchema.statics.upsertWatcher = function(user, targetModel, target, status) {
  const query = { user, targetModel, target };
  const doc = { ...query, status };
  const options = {
    upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true,
  };
  return this.findOneAndUpdate(query, doc, options);
};

subscriptionSchema.statics.watchByPageId = function(user, pageId, status) {
  return this.upsertWatcher(user, 'Page', pageId, status);
};

subscriptionSchema.statics.getWatchers = async function(target) {
  return this.find({ target, status: STATUS_WATCH }).distinct('user');
};

subscriptionSchema.statics.getIgnorers = async function(target) {
  return this.find({ target, status: STATUS_IGNORE }).distinct('user');
};

subscriptionSchema.statics.STATUS_WATCH = function() {
  return STATUS_WATCH;
};

subscriptionSchema.statics.STATUS_IGNORE = function() {
  return STATUS_IGNORE;
};

export default getOrCreateModel<SubscriptionDocument, SubscriptionModel>('Subscription', subscriptionSchema);
