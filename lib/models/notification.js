module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:notification')
    , mongoose = require('mongoose')
    , ObjectId = mongoose.Schema.Types.ObjectId
  ;

  // TODO: slack 以外の対応
  notificationSchema = new mongoose.Schema({
    pathPattern: { type: String, required: true },
    patternPrefix:  { type: String, required: true },
    patternPrefix2: { type: String, required: true },
    channel: { type: String, required: true },
    provider: { type: String, required: true },
    creator: { type: ObjectId, ref: 'User', index: true  },
    createdAt: { type: Date, default: Date.now }
  });

  function createPrefixesbyPathPattern (pathPattern)
  {
    return ['*', '*'];
  }

  notificationSchema.statics.findSettingsByPath = function(path)
  {
    var Notification = this;

    return new Promise(function(resolve, reject) {
    });
  };

  notificationSchema.statics.findAll = function(offset)
  {
    var Notification = this;
    var offset = offset || 0;

    return new Promise(function(resolve, reject) {
      Notification
        .find()
        .sort({'createdAt': 1})
        .populate('creator')
        .exec(function(err, data) {
          if (err) {
            return reject(err);
          }

          if (data.length < 1) {
            return resolve([]);
          }

          return resolve(data);
        });
    });
  };

  notificationSchema.statics.create = function(pathPatter, channel, user)
  {
    var Notification = this;
    var provider = 'slack'; // now slack only

    var notif = new Notification;
    notif.pathPattern = pathPattern;
    notif.channel = Notification.nomalizeChannelName(channel);
    notif.provider = provider;
    notif.creator = user;
    notif.createdAt = Date.now();

    return new Promise(function(resolve, reject) {
      notif.save(function(err, data) {
        if (err) {
          debug('Error on saving notification.', err);
          return reject(err);
        }
        debug('notification saved.', data);
        return resolve(data);
      });
    });
  };

  notificationSchema.statics.remove = function(id)
  {
    var Notification = this;

    return new Promise(function(resolve, reject) {
      Notification.findOneAndRemove({_id: id}, function(err, data) {
        if (err) {
          debug('Notification.findOneAndRemove failed', err);
          return reject(err);
        }

        return resolve(data);
      });
    });
  };

  return mongoose.model('Attachment', attachmentSchema);
};

