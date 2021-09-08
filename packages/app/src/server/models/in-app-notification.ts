import {
  Types, Document, Model, Schema /* , Query */, model,
} from 'mongoose';
import { subDays } from 'date-fns';
import ActivityDefine from '../util/activityDefine';
import loggerFactory from '~/utils/logger';
import Crowi from '../crowi';
import { ActivityDocument } from './activity';
import User = require('./user');

const logger = loggerFactory('growi:models:inAppNotification');

const STATUS_UNREAD = 'UNREAD';
const STATUS_UNOPENED = 'UNOPENED';
const STATUS_OPENED = 'OPENED';
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
  upsertByActivity(user: Types.ObjectId, activity: ActivityDocument, createdAt?: Date | null): Promise<InAppNotificationDocument | null>
  removeActivity(activity: any): any
  // commented out type 'Query' temporary to avoid ts error
  removeEmpty()/* : Query<any> */
  read(user: typeof User) /* : Promise<Query<any>> */

  open(user: typeof User, id: Types.ObjectId): Promise<InAppNotificationDocument | null>
  getUnreadCountByUser(user: Types.ObjectId): Promise<number | undefined>

  STATUS_UNREAD: string
  STATUS_UNOPENED: string
  STATUS_OPENED: string
}

export default (crowi: Crowi) => {
  const inAppNotificationEvent = crowi.event('inAppNotification');

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
  inAppNotificationSchema.virtual('actionUsers').get(function(this: InAppNotificationDocument) {
    const Activity = crowi.model('Activity');
    return Activity.getActionUsersFromActivities((this.activities as any) as ActivityDocument[]);
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

    return InAppNotification.find({ user })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate(['user', 'target'])
      .populate({ path: 'activities', populate: { path: 'user' } })
      .exec();
  };

  inAppNotificationSchema.statics.upsertByActivity = async function(user, activity, createdAt = null) {
    const {
      _id: activityId, targetModel, target, action,
    } = activity;

    const now = createdAt || Date.now();
    const lastWeek = subDays(now, 7);
    const query = {
      user, target, action, createdAt: { $gt: lastWeek },
    };
    const parameters = {
      user,
      targetModel,
      target,
      action,
      status: STATUS_UNREAD,
      createdAt: now,
      $addToSet: { activities: activityId },
    };

    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    };

    const inAppNotification = await InAppNotification.findOneAndUpdate(query, parameters, options);

    if (inAppNotification) {
      inAppNotificationEvent.emit('update', inAppNotification.user);
    }

    return inAppNotification;
  };

  inAppNotificationSchema.statics.removeActivity = async function(activity) {
    const { _id, target, action } = activity;
    const query = { target, action };
    const parameters = { $pull: { activities: _id } };

    const result = await InAppNotification.updateMany(query, parameters);

    await InAppNotification.removeEmpty();
    return result;
  };

  inAppNotificationSchema.statics.removeEmpty = function() {
    return InAppNotification.deleteMany({ activities: { $size: 0 } });
  };

  inAppNotificationSchema.statics.read = async function(user) {
    const query = { user, status: STATUS_UNREAD };
    const parameters = { status: STATUS_UNOPENED };

    return InAppNotification.updateMany(query, parameters);
  };

  inAppNotificationSchema.statics.open = async function(user, id) {
    const query = { _id: id, user: user._id };
    const parameters = { status: STATUS_OPENED };
    const options = { new: true };

    const inAppNotification = await InAppNotification.findOneAndUpdate(query, parameters, options);
    if (inAppNotification) {
      inAppNotificationEvent.emit('update', inAppNotification.user);
    }
    return inAppNotification;
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

  const InAppNotification = model<InAppNotificationDocument, InAppNotificationModel>('InAppNotification', inAppNotificationSchema);

  return InAppNotification;
};
