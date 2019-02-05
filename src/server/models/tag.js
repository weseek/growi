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

  tagSchema.statics.settingTags = function(page, tag) {
    const PageTagRelation = crowi.model('PageTagRelation');
    return this.create({name: tag}, function(err, createdTag) {
      // console.log(createdTag);
      // Relation を作成
      PageTagRelation.createRelation(page.id, createdTag.id);
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

//   commentSchema.statics.removeCommentsByPageId = function (pageId) {
//     var Comment = this;

//     return new Promise(function (resolve, reject) {
//       Comment.remove({
//         page: pageId
//       }, function (err, done) {
//         if (err) {
//           return reject(err);
//         }

//         resolve(done);
//       });
//     });
//   };

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
