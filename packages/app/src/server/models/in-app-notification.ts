import {
  Types, Document, Model, Schema /* , Query */,
} from 'mongoose';
import ActivityDefine from '../util/activityDefine';
import { getOrCreateModel } from '../util/mongoose-utils';
import loggerFactory from '../../utils/logger';

const logger = loggerFactory('growi:models:inAppNotification');

export const STATUS_UNREAD = 'UNREAD';
export const STATUS_UNOPENED = 'UNOPENED';
export const STATUS_OPENED = 'OPENED';
const STATUSES = [STATUS_UNREAD, STATUS_UNOPENED, STATUS_OPENED];

export interface InAppNotificationDocument extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  targetModel: string
  target: Types.ObjectId
  action: string
  activities: Types.ObjectId[]
  status: string
  createdAt: Date
}

export interface InAppNotificationModel extends Model<InAppNotificationDocument> {
  findLatestInAppNotificationsByUser(user: Types.ObjectId, skip: number, offset: number): Promise<InAppNotificationDocument[]>

  // commented out type 'Query' temporary to avoid ts error
  removeEmpty()/* : Query<any> */
  read(user) /* : Promise<Query<any>> */

  open(user, id: Types.ObjectId): Promise<InAppNotificationDocument | null>
  getUnreadCountByUser(user: Types.ObjectId): Promise<number | undefined>

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
    enum: STATUSES,
    index: true,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const transform = (doc, ret) => {
  // delete ret.activities
};
inAppNotificationSchema.set('toObject', { virtuals: true, transform });
inAppNotificationSchema.set('toJSON', { virtuals: true, transform });
inAppNotificationSchema.index({
  user: 1, target: 1, action: 1, createdAt: 1,
});

inAppNotificationSchema.statics.findLatestInAppNotificationsByUser = function(user, limitNum, offset) {
  const limit = limitNum || 10;

  // TODO: improve populate refer to GROWI way by GW-7482
  return InAppNotification.find({ user })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate(['user', 'target'])
    .populate({ path: 'activities', populate: { path: 'user' } })
    .exec();
};

inAppNotificationSchema.statics.removeEmpty = function() {
  return InAppNotification.deleteMany({ activities: { $size: 0 } });
};

inAppNotificationSchema.statics.read = async function(user) {
  const query = { user, status: STATUS_UNREAD };
  const parameters = { status: STATUS_UNOPENED };

  return InAppNotification.updateMany(query, parameters);
};

inAppNotificationSchema.statics.getUnreadCountByUser = async function(user) {
  const query = { user, status: STATUS_UNREAD };

  try {
    const count = await InAppNotification.countDocuments(query);

    return count;
  }
  catch (err) {
    logger.error('Error on getUnreadCountByUser', err);
    throw err;
  }
};

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
