import {
  Types, Document, Model, Schema,
} from 'mongoose';
import Crowi from '../crowi';

import { getOrCreateModel, getModelSafely } from '../util/mongoose-utils';
import loggerFactory from '../../utils/logger';
import ActivityDefine from '../util/activityDefine';

import Subscription from './subscription';
// import { InAppNotification } from './in-app-notification';

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

export type ActivityModel = Model<ActivityDocument>

module.exports = function(crowi: Crowi) {
  const activityEvent = crowi.event('activity');

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

  // /**
  //    * @param {object} parameters
  //    * @return {Promise}
  //    */
  // activitySchema.statics.createByParameters = function(parameters) {
  //   return this.create(parameters);
  // };

  // /**
  //    * @param {Comment} comment
  //    * @return {Promise}
  //    */
  // activitySchema.statics.createByPageComment = function(comment) {
  //   const parameters = {
  //     user: comment.creator,
  //     targetModel: ActivityDefine.MODEL_PAGE,
  //     target: comment.page,
  //     eventModel: ActivityDefine.MODEL_COMMENT,
  //     event: comment._id,
  //     action: ActivityDefine.ACTION_COMMENT,
  //   };

  //   return this.createByParameters(parameters);
  // };

  // /**
  //    * @param {Page} page
  //    * @param {User} user
  //    * @return {Promise}
  //    */
  // activitySchema.statics.createByPageLike = function(page, user) {
  //   const parameters = {
  //     user: user._id,
  //     targetModel: ActivityDefine.MODEL_PAGE,
  //     target: page,
  //     action: ActivityDefine.ACTION_LIKE,
  //   };

  //   return this.createByParameters(parameters);
  // };

  // /**
  //    * @param {User} user
  //    * @return {Promise}
  //    */
  // activitySchema.statics.findByUser = function(user) {
  //   return this.find({ user }).sort({ createdAt: -1 }).exec();
  // };

  // activitySchema.statics.getActionUsersFromActivities = function(activities) {
  //   return activities.map(({ user }) => user).filter((user, i, self) => self.indexOf(user) === i);
  // };

  activitySchema.methods.getNotificationTargetUsers = async function() {
    const User = getModelSafely('User') || require('~/server/models/user')();
    const { user: actionUser, targetModel, target } = this;

    const model: any = await this.model(targetModel).findById(target);
    const [targetUsers, watchUsers, ignoreUsers] = await Promise.all([
      model.getNotificationTargetUsers(),
      Subscription.getWatchers((target as any) as Types.ObjectId),
      Subscription.getUnwatchers((target as any) as Types.ObjectId),
    ]);

    const unique = array => Object.values(array.reduce((objects, object) => ({ ...objects, [object.toString()]: object }), {}));
    const filter = (array, pull) => {
      const ids = pull.map(object => object.toString());
      return array.filter(object => !ids.includes(object.toString()));
    };
    const notificationUsers = filter(unique([...targetUsers, ...watchUsers]), [...ignoreUsers, actionUser]);
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

  return getOrCreateModel<ActivityDocument, ActivityModel>('Activity', activitySchema);

};
