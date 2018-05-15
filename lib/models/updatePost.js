/**
 * This is the setting for notify to 3rd party tool (like Slack).
 */
module.exports = function(crowi) {
  var debug = require('debug')('growi:models:updatePost')
    , mongoose = require('mongoose')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , updatePostSchema
  ;

  // TODO: slack 以外の対応
  updatePostSchema = new mongoose.Schema({
    pathPattern: { type: String, required: true },
    patternPrefix:  { type: String, required: true },
    patternPrefix2: { type: String, required: true },
    channel: { type: String, required: true },
    provider: { type: String, required: true },
    creator: { type: ObjectId, ref: 'User', index: true  },
    createdAt: { type: Date, default: Date.now }
  });

  updatePostSchema.statics.normalizeChannelName = function(channel) {
    return channel.replace(/(#|,)/g, '');
  };

  updatePostSchema.statics.createPrefixesByPathPattern = function(pathPattern) {
    var patternPrefix = ['*', '*'];

    // not begin with slash
    if (!pathPattern.match(/^\/.+/)) {
      return patternPrefix;
    }

    var pattern = pathPattern.split('/');
    pattern.shift();
    if (pattern[0] && pattern[0] != '*') {
      patternPrefix[0] = pattern[0];
    }

    if (pattern[1] && pattern[1] != '*') {
      patternPrefix[1] = pattern[1];
    }
    return patternPrefix;
  };

  updatePostSchema.statics.getRegExpByPattern = function(pattern) {
    var reg = pattern;
    if (!reg.match(/^\/.*/)) {
      reg = '/*' + reg + '*';
    }
    reg = '^' + reg;
    reg = reg.replace(/\//g, '\\/');
    reg = reg.replace(/(\*)/g, '.*');

    return new RegExp(reg);
  };

  updatePostSchema.statics.findSettingsByPath = function(path) {
    var UpdatePost = this;
    var prefixes = UpdatePost.createPrefixesByPathPattern(path);

    return new Promise(function(resolve, reject) {
      UpdatePost.find({$or: [
        {patternPrefix: prefixes[0], patternPrefix2: prefixes[1]},
        {patternPrefix: '*', patternPrefix2: '*'},
        {patternPrefix: prefixes[0], patternPrefix2: '*'},
        {patternPrefix: '*', patternPrefix2: prefixes[1]},
      ]}).then(function(settings) {
        if (settings.length <= 0) {
          return resolve(settings);
        }

        settings = settings.filter(function(setting) {
          var patternRegex = UpdatePost.getRegExpByPattern(setting.pathPattern);
          return patternRegex.test(path);
        });

        return resolve(settings);
      });
    });
  };

  updatePostSchema.statics.findAll = function(offset) {
    var UpdatePost = this;
    var offset = offset || 0;

    return new Promise(function(resolve, reject) {
      UpdatePost
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

  updatePostSchema.statics.create = function(pathPattern, channel, user) {
    var UpdatePost = this;
    var provider = 'slack'; // now slack only

    var prefixes = UpdatePost.createPrefixesByPathPattern(pathPattern);
    var notif = new UpdatePost;
    notif.pathPattern = pathPattern;
    notif.patternPrefix = prefixes[0];
    notif.patternPrefix2 = prefixes[1];
    notif.channel = UpdatePost.normalizeChannelName(channel);
    notif.provider = provider;
    notif.creator = user;
    notif.createdAt = Date.now();

    return new Promise(function(resolve, reject) {
      notif.save(function(err, doc) {
        if (err) {
          return reject(err);
        }

        return resolve(doc);
      });
    });
  };

  updatePostSchema.statics.remove = function(id) {
    var UpdatePost = this;

    return new Promise(function(resolve, reject) {
      UpdatePost.findOneAndRemove({_id: id}, function(err, data) {
        if (err) {
          debug('UpdatePost.findOneAndRemove failed', err);
          return reject(err);
        }

        return resolve(data);
      });
    });
  };

  return mongoose.model('UpdatePost', updatePostSchema);
};

