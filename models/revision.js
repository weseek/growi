module.exports = function(app, models) {
  var mongoose = require('mongoose')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , revisionSchema;

  revisionSchema = new mongoose.Schema({
    path: { type: String, required: true },
    body: { type: String, required: true },
    format: { type: String, default: 'markdown' },
    author: { type: ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  });

  revisionSchema.statics.findLatestRevision = function(path, cb) {
    this.find({path: path})
      .sort({'createdAt': -1})
      .limit(1)
      .exec(function(err, data) {
        cb(err, data.shift());
      });
  };

  revisionSchema.statics.findRevisionList = function(path, options, cb) {
    this.find({path: path})
      .sort({'createdAt': -1})
      .populate('author')
      .exec(function(err, data) {
        cb(err, data);
      });
  };

  revisionSchema.statics.updateRevisionListByPath = function(path, updateData, options, cb) {
    this.update({path: path}, {$set: updateData}, {multi: true}, function(err, data) {
      cb(err, data);
    });
  };

  revisionSchema.statics.findRevision = function(id, cb) {
    this.findById(id)
      .populate('author')
      .exec(function(err, data) {
        cb(err, data);
      });
  };

  revisionSchema.statics.prepareRevision = function(pageData, body, user, options) {
    var Revision = this;

    if (!options) {
      options = {};
    }
    var format = options.format || 'markdown';

    if (!user._id) {
      throw new Error('Error: user should have _id');
    }

    var newRevision = new Revision();
    newRevision.path = pageData.path;
    newRevision.body = body;
    newRevision.format = format;
    newRevision.author = user._id;
    newRevision.createdAt = Date.now();

    return newRevision;
  };

  revisionSchema.statics.updatePath = function(pathName) {
  };

  models.Revision = mongoose.model('Revision', revisionSchema);

  return models.Revision;
};
