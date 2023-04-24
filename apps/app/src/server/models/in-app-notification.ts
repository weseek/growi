import {
  Types, Document, Schema, Model,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { AllSupportedTargetModels, AllSupportedActions } from '~/interfaces/activity';
import { InAppNotificationStatuses } from '~/interfaces/in-app-notification';

import { getOrCreateModel } from '../util/mongoose-utils';

import { ActivityDocument } from './activity';


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
  snapshot: string
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
  action: {
    type: String,
    required: true,
    enum: AllSupportedActions,
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
    required: true,
  },
  snapshot: {
    type: String,
    required: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
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
