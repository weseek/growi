import {
  Types, Document, Schema, Model,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { getOrCreateModel } from '@growi/core';
import { ActivityDocument } from './activity';
import ActivityDefine from '../util/activityDefine';

import { InAppNotificationStatuses } from '~/interfaces/in-app-notification';

const { STATUS_UNREAD, STATUS_UNOPENED, STATUS_OPENED } = InAppNotificationStatuses;

export interface InAppNotificationDocument extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  targetModel: string
  target: Types.ObjectId
  action: string
  activities: ActivityDocument[]
  status: string
  createdAt: Date
}


export interface InAppNotificationModel extends Model<InAppNotificationDocument> {
  findLatestInAppNotificationsByUser(user: Types.ObjectId, skip: number, offset: number)
  getUnreadCountByUser(user: Types.ObjectId): Promise<number | undefined>
  open(user, id: Types.ObjectId): Promise<InAppNotificationDocument | null>
  read(user) /* : Promise<Query<any>> */

  STATUS_UNREAD: string
  STATUS_UNOPENED: string
  STATUS_OPENED: string
}

const inAppNotificationSchema = new Schema<InAppNotificationDocument, InAppNotificationModel>({
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
  activities: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
    },
  ],
  status: {
    type: String,
    default: STATUS_UNREAD,
    enum: InAppNotificationStatuses,
    index: true,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
inAppNotificationSchema.plugin(mongoosePaginate);

const transform = (doc, ret) => {
  delete ret.activities;
};
inAppNotificationSchema.set('toObject', { virtuals: true, transform });
inAppNotificationSchema.set('toJSON', { virtuals: true, transform });
inAppNotificationSchema.index({
  user: 1, target: 1, action: 1, createdAt: 1,
});

inAppNotificationSchema.statics.STATUS_UNOPENED = function() {
  return STATUS_UNOPENED;
};
inAppNotificationSchema.statics.STATUS_UNREAD = function() {
  return STATUS_UNREAD;
};
inAppNotificationSchema.statics.STATUS_OPENED = function() {
  return STATUS_OPENED;
};

const InAppNotification = getOrCreateModel<InAppNotificationDocument, InAppNotificationModel>('InAppNotification', inAppNotificationSchema);

export { InAppNotification };
