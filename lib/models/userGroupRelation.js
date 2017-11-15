module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:userGroupRelation')
    , mongoose = require('mongoose')
    , mongoosePaginate = require('mongoose-paginate')
    , ObjectId = mongoose.Schema.Types.ObjectId

    , PAGE_ITEMS = 50

    , userGroupRelationSchema;

  userGroupRelationSchema = new mongoose.Schema({
    relatedGroup: { type: ObjectId, ref: 'UserGroup' },
    relatedUser: { type: ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  });
  userGroupRelationSchema.plugin(mongoosePaginate);
  userGroupRelationSchema.plugin(uniqueValidator);

  // すべてのグループ所属関係を取得
  userGroupRelationSchema.statics.findAllRelation = function() {
    debug('findAllGroups is called');
    var UserGroupRelation = this;

    return new Promise(function(resolve, reject) {
      UserGroupRelation
        .find({ relatedGroup: group} )
        .exec(function (err, userGroupRelationData) {
          if (err) {
            return reject(err);
          }

          return resolve(userGroupRelationData);
        });
    });
  };

  // すべてのグループ所属関係を取得
  userGroupRelationSchema.statics.findAllRelation = function (group) {
    debug('findAllGroups is called');
    var UserGroupRelation = this;

    return new Promise(function (resolve, reject) {
      UserGroupRelation
        .find({ relatedGroup: group })
        .exec(function (err, userGroupRelationData) {
          if (err) {
            return reject(err);
          }

          return resolve(userGroupRelationData);
        });
    });
  };

  // ページネーション利用の検索
  userGroupRelationSchema.statics.findUserGroupRelationsWithPagination = function(options, callback) {

    this.paginate({ page: options.page || 1, limit: options.limit || PAGE_ITEMS }, function(err, result) {
      if (err) {
        debug('Error on pagination:', err);
        return callback(err, null);
      }

      return callback(err, result);
    });
  };

  // 関係性の生成
  userGroupRelationSchema.statics.createRelation = function(userGroup, user, callback) {
    var UserGroupRelation = this
      , newUserGroupRelation = new UserGroupRelation();

    newUserGroupRelation.relatedGroup = group;
    newUserGroupRelation.relatedUser = user;
    newUserGroupRelation.createdAt = Date.now();

    newUserGroupRelation.save(function(err, userGroupRelationData) {
      return callback(err, userGroupRelationData);
    });
  };

  userGroupRelationSchema.statics.PAGE_ITEMS         = PAGE_ITEMS;

  return mongoose.model('UserGroupRelation', userGroupRelationSchema);
};
