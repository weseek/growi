import { SubscriptionStatusType, AllSubscriptionStatusType } from '@growi/core';
import {
  Types, Document, Model, Schema,
} from 'mongoose';

import { AllSupportedTargetModels } from '~/interfaces/activity';

import { getOrCreateModel } from '../util/mongoose-utils';


export interface ISubscription {
  user: Types.ObjectId
  targetModel: string
  target: Types.ObjectId
  status: string
  createdAt: Date

  isSubscribing(): boolean
  isUnsubscribing(): boolean
}

export interface SubscriptionDocument extends ISubscription, Document {}

export interface SubscriptionModel extends Model<SubscriptionDocument> {
  findByUserIdAndTargetId(userId: Types.ObjectId | string, targetId: Types.ObjectId | string): any
  upsertSubscription(user: Types.ObjectId, targetModel: string, target: Types.ObjectId, status: string): any
  subscribeByPageId(user: Types.ObjectId, pageId: Types.ObjectId, status: string): any
  getSubscription(target: Types.ObjectId): Promise<Types.ObjectId[]>
  getUnsubscription(target: Types.ObjectId): Promise<Types.ObjectId[]>
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
    required: true,
    enum: AllSupportedTargetModels,
  },
  target: {
    type: Schema.Types.ObjectId,
    refPath: 'targetModel',
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: AllSubscriptionStatusType,
  },
}, {
  timestamps: true,
});

subscriptionSchema.methods.isSubscribing = function() {
  return this.status === SubscriptionStatusType.SUBSCRIBE;
};

subscriptionSchema.methods.isUnsubscribing = function() {
  return this.status === SubscriptionStatusType.UNSUBSCRIBE;
};

subscriptionSchema.statics.findByUserIdAndTargetId = function(userId, targetId) {
  return this.findOne({ user: userId, target: targetId });
};

subscriptionSchema.statics.upsertSubscription = function(user, targetModel, target, status) {
  const query = { user, targetModel, target };
  const doc = { ...query, status };
  const options = {
    upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true,
  };
  return this.findOneAndUpdate(query, doc, options);
};

subscriptionSchema.statics.subscribeByPageId = function(user, pageId, status) {
  return this.upsertSubscription(user, 'Page', pageId, status);
};

subscriptionSchema.statics.getSubscription = async function(target) {
  return this.find({ target, status: SubscriptionStatusType.SUBSCRIBE }).distinct('user');
};

subscriptionSchema.statics.getUnsubscription = async function(target) {
  return this.find({ target, status: SubscriptionStatusType.UNSUBSCRIBE }).distinct('user');
};

export default getOrCreateModel<SubscriptionDocument, SubscriptionModel>('Subscription', subscriptionSchema);
