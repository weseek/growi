import {
  Types, Document, Model, Schema, model,
} from 'mongoose';

import ActivityDefine from '../util/activityDefine';

const STATUS_WATCH = 'WATCH';
const STATUS_IGNORE = 'IGNORE';
const STATUSES = [STATUS_WATCH, STATUS_IGNORE];

export interface WatcherDocument extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  targetModel: string
  target: Types.ObjectId
  status: string
  createdAt: Date

  isWatching(): boolean
  isIgnoring(): boolean
}

export interface WatcherModel extends Model<WatcherDocument> {
  findByUserIdAndTargetId(userId: Types.ObjectId, targetId: Types.ObjectId): any
  upsertWatcher(user: Types.ObjectId, targetModel: string, target: Types.ObjectId, status: string): any
  watchByPageId(user: Types.ObjectId, pageId: Types.ObjectId, status: string): any
  getWatchers(target: Types.ObjectId): Promise<Types.ObjectId[]>
  getIgnorers(target: Types.ObjectId): Promise<Types.ObjectId[]>
}

export default (): WatcherModel => {

  const watcherSchema = new Schema<WatcherDocument, WatcherModel>({
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

  watcherSchema.methods.isWatching = function() {
    return this.status === STATUS_WATCH;
  };

  watcherSchema.methods.isIgnoring = function() {
    return this.status === STATUS_IGNORE;
  };

  watcherSchema.statics.findByUserIdAndTargetId = function(userId, targetId) {
    return this.findOne({ user: userId, target: targetId });
  };

  watcherSchema.statics.upsertWatcher = function(user, targetModel, target, status) {
    const query = { user, targetModel, target };
    const doc = { ...query, status };
    const options = {
      upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true,
    };
    return Watcher.findOneAndUpdate(query, doc, options);
  };

  watcherSchema.statics.watchByPageId = function(user, pageId, status) {
    return this.upsertWatcher(user, 'Page', pageId, status);
  };

  watcherSchema.statics.getWatchers = async function(target) {
    return Watcher.find({ target, status: STATUS_WATCH }).distinct('user');
  };

  watcherSchema.statics.getIgnorers = async function(target) {
    return Watcher.find({ target, status: STATUS_IGNORE }).distinct('user');
  };

  watcherSchema.statics.STATUS_WATCH = function() {
    return STATUS_WATCH;
  };

  watcherSchema.statics.STATUS_IGNORE = function() {
    return STATUS_IGNORE;
  };

  const Watcher = model<WatcherDocument, WatcherModel>('Watcher', watcherSchema);

  return Watcher;
};
