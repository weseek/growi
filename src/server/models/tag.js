module.exports = function (crowi) {
  var debug = require('debug')('growi:models:tag'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    // USER_PUBLIC_FIELDS = '_id name username createdAt',
    USER_PUBLIC_FIELDS = '_id name',
    tagSchema;

  tagSchema = new mongoose.Schema({
    // page: {
    //   type: ObjectId,
    //   ref: 'Page',
    //   index: true
    // },
    // creator: {
    //   type: ObjectId,
    //   ref: 'User',
    //   index: true
    // },
    // revision: {
    //   type: ObjectId,
    //   ref: 'Revision',
    //   index: true
    // },
    name: {
      type: String,
      required: true
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now
    // },
  });

  /**
   * create a tag (Promise wrapper)
   */
  tagSchema.statics.createTag = function(tag) {
    return new Promise((resolve, reject) => {
      this.create({name: tag}, function(err, createdTag) {
        if (err) {
          reject(err);
        }
        resolve(createdTag);
      });
    });
  };

  // get a tag by id (Promise wrpper)
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

//   commentSchema.statics.getCommentsByPageId = function (id) {
//     var self = this;

//     return new Promise(function (resolve, reject) {
//       self
//         .find({
//           page: id
//         })
//         .sort({
//           'createdAt': -1
//         })
//         .populate('creator', USER_PUBLIC_FIELDS)
//         .exec(function (err, data) {
//           if (err) {
//             return reject(err);
//           }

//           if (data.length < 1) {
//             return resolve([]);
//           }

//           //debug('Comment loaded', data);
//           return resolve(data);
//         });
//     });
//   };

//   commentSchema.statics.getCommentsByRevisionId = function (id) {
//     var self = this;

//     return new Promise(function (resolve, reject) {
//       self
//         .find({
//           revision: id
//         })
//         .sort({
//           'createdAt': -1
//         })
//         .populate('creator', USER_PUBLIC_FIELDS)
//         .exec(function (err, data) {
//           if (err) {
//             return reject(err);
//           }

//           if (data.length < 1) {
//             return resolve([]);
//           }

//           debug('Comment loaded', data);
//           return resolve(data);
//         });
//     });
//   };

//   commentSchema.statics.countCommentByPageId = function (page) {
//     var self = this;

//     return new Promise(function (resolve, reject) {
//       self.count({
//         page: page
//       }, function (err, data) {
//         if (err) {
//           return reject(err);
//         }

//         return resolve(data);
//       });
//     });
//   };

  tagSchema.statics.removeTagById = function(tagId) {
    const Tag = this;
    Tag.remove({_id: tagId}, function(err, done) {
      if (err) {
        throw new Error(err);
      }
    });
  };

//   /**
//    * post save hook
//    */
//   commentSchema.post('save', function (savedComment) {
//     var Page = crowi.model('Page'),
//       Comment = crowi.model('Comment');

//     Page.updateCommentCount(savedComment.page)
//       .then(function (page) {
//         debug('CommentCount Updated', page);
//       }).catch(function () {});
//   });

  return mongoose.model('Tag', tagSchema);
};
