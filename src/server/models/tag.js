module.exports = function(crowi) {
  var debug = require('debug')('growi:models:tag'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    USER_PUBLIC_FIELDS = '_id name',
    tagSchema;

  tagSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
  });

  /**
   * create a tag (Promise wrapper)
   */
  tagSchema.statics.createTag = function(tag) {
    debug('create new tag:', tag);
    return new Promise((resolve, reject) => {
      this.create({name: tag}, function(err, createdTag) {
        if (err) {
          reject(err);
        }
        resolve(createdTag);
      });
    });
  };

  /**
   * get a tag by id(Promise wrpper)
   */
  tagSchema.statics.getOneById = function(id) {
    return new Promise((resolve, reject) => {
      this.find({
        _id: id
      }, function(err, tags) {
        if (err) {
          reject(err);
        }
        resolve(tags[0]);
      });
    });
  };

  tagSchema.statics.removeById = function(tagId) {
    const Tag = this;
    Tag.remove({_id: tagId}, function(err, done) {
      if (err) {
        throw new Error(err);
      }
      debug('deleta tag:', tagId);
    });
  };

  return mongoose.model('Tag', tagSchema);
};
