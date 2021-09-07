import {
  Types, Document, Model, Schema /* , Query */, model,
} from 'mongoose';
import { subDays } from 'date-fns';
import ActivityDefine from '../util/activityDefine';
import loggerFactory from '~/utils/logger';
import Crowi from '../crowi';
import { ActivityDocument } from './activity';
import User = require('./user');

const logger = loggerFactory('growi:models:notification');

const STATUS_UNREAD = 'UNREAD';
const STATUS_UNOPENED = 'UNOPENED';
const STATUS_OPENED = 'OPENED';
const STATUSES = [STATUS_UNREAD, STATUS_UNOPENED, STATUS_OPENED];

export interface NotificationDocument extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  targetModel: string
  target: Types.ObjectId
  action: string
  activities: Types.ObjectId[]
  status: string
  createdAt: Date
}

export interface NotificationModel extends Model<NotificationDocument> {
  findLatestNotificationsByUser(user: Types.ObjectId, skip: number, offset: number): Promise<NotificationDocument[]>
  upsertByActivity(user: Types.ObjectId, activity: ActivityDocument, createdAt?: Date | null): Promise<NotificationDocument | null>
  removeActivity(activity: any): any
  // commented out type 'Query' temporary to avoid ts error
  removeEmpty()/* : Query<any> */
  read(user: typeof User) /* : Promise<Query<any>> */

  open(user: typeof User, id: Types.ObjectId): Promise<NotificationDocument | null>
  getUnreadCountByUser(user: Types.ObjectId): Promise<number | undefined>

  STATUS_UNREAD: string
  STATUS_UNOPENED: string
  STATUS_OPENED: string
}

export default (crowi: Crowi) => {
  const notificationEvent = crowi.event('Notification');

  const notificationSchema = new Schema<NotificationDocument, NotificationModel>({
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
  notificationSchema.virtual('actionUsers').get(function(this: NotificationDocument) {
    const Activity = crowi.model('Activity');
    return Activity.getActionUsersFromActivities((this.activities as any) as ActivityDocument[]);
  });
  const transform = (doc, ret) => {
    // delete ret.activities
  };
  notificationSchema.set('toObject', { virtuals: true, transform });
  notificationSchema.set('toJSON', { virtuals: true, transform });
  notificationSchema.index({
    user: 1, target: 1, action: 1, createdAt: 1,
  });

  notificationSchema.statics.findLatestNotificationsByUser = function(user, limitNum, offset) {
    const limit = limitNum || 10;

    return Notification.find({ user })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate(['user', 'target'])
      .populate({ path: 'activities', populate: { path: 'user' } })
      .exec();
  };

  notificationSchema.statics.upsertByActivity = async function(user, activity, createdAt = null) {
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

    const notification = await Notification.findOneAndUpdate(query, parameters, options);

    if (notification) {
      notificationEvent.emit('update', notification.user);
    }

    return notification;
  };

  notificationSchema.statics.removeActivity = async function(activity) {
    const { _id, target, action } = activity;
    const query = { target, action };
    const parameters = { $pull: { activities: _id } };

    const result = await Notification.updateMany(query, parameters);

    await Notification.removeEmpty();
    return result;
  };

  notificationSchema.statics.removeEmpty = function() {
    return Notification.deleteMany({ activities: { $size: 0 } });
  };

  notificationSchema.statics.read = async function(user) {
    const query = { user, status: STATUS_UNREAD };
    const parameters = { status: STATUS_UNOPENED };

    return Notification.updateMany(query, parameters);
  };

  notificationSchema.statics.open = async function(user, id) {
    const query = { _id: id, user: user._id };
    const parameters = { status: STATUS_OPENED };
    const options = { new: true };

    const notification = await Notification.findOneAndUpdate(query, parameters, options);
    if (notification) {
      notificationEvent.emit('update', notification.user);
    }
    return notification;
  };

  notificationSchema.statics.getUnreadCountByUser = async function(user) {
    const query = { user, status: STATUS_UNREAD };

    try {
      const count = await Notification.countDocuments(query);

      return count;
    }
    catch (err) {
      logger.error('Error on getUnreadCountByUser', err);
      throw err;
    }
  };

  notificationEvent.on('update', (user) => {
    const socket = crowi.getSocketIoService();

    if (socket != null) {
      socket.emit('notification updated', { user });
    }
  });

  notificationSchema.statics.STATUS_UNOPENED = function() {
    return STATUS_UNOPENED;
  };
  notificationSchema.statics.STATUS_UNREAD = function() {
    return STATUS_UNREAD;
  };
  notificationSchema.statics.STATUS_OPENED = function() {
    return STATUS_OPENED;
  };

  const Notification = model<NotificationDocument, NotificationModel>('Notification', notificationSchema);

  return Notification;
};
