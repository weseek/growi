module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:userGroupRelation')
    , mongoose = require('mongoose')
    , mongoosePaginate = require('mongoose-paginate')
    , ObjectId = mongoose.Schema.Types.ObjectId

    , PAGE_ITEMS = 50

    , userGroupRelationSchema;

  userGroupRelationSchema = new mongoose.Schema({
    userGroupRelationId: String,
    relatedGroup: { type: ObjectId, ref: 'UserGroup' },
    relatedUser: { type: ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },{
    toJSON: { getters: true },
    toObject: { getters: true }
  });
  userGroupRelationSchema.plugin(mongoosePaginate);

  // すべてのグループ所属関係を取得
  userGroupRelationSchema.statics.findAllRelation = function() {
    debug('findAllGroups is called');
    var UserGroupRelation = this;

    return new Promise(function(resolve, reject) {
      UserGroupRelation
        .find({ relatedGroup: group} )
        .populate('relatedUser')
        .exec(function (err, userGroupRelationData) {
          if (err) {
            return reject(err);
          }

          return resolve(userGroupRelationData);
        });
    });
  };

  // すべてのグループ所属関係を取得
  userGroupRelationSchema.statics.findAllRelationForUserGroup = function (group) {
    debug('findAllGroups is called', group);
    var UserGroupRelation = this;

    return new Promise(function (resolve, reject) {
      UserGroupRelation
        .find({ relatedGroup: group })
        .populate('relatedUser')
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

    this.paginate({}, { page: options.page || 1, limit: options.limit || PAGE_ITEMS }, function(err, result) {
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

    newUserGroupRelation.relatedGroup = userGroup;
    newUserGroupRelation.relatedUser = user;
    newUserGroupRelation.createdAt = Date.now();

    debug('create new user-group-relation ', newUserGroupRelation);
    newUserGroupRelation.save(function(err, userGroupRelationData) {
      return callback(err, userGroupRelationData);
    });
  };

  // グループに紐づく関係性の全削除
  userGroupRelationSchema.statics.removeAllByUserGroup = function (userGroup, callback) {

    if (userGroup === null || userGroup === undefined) { return callback(null); }
    var UserGroupRelation = this
    var relations = UserGroupRelation.findAllRelation(userGroup);

    // 関係性削除の実装
    relations.array.forEach(relation => {
      UserGroupRelation.removeById(relation.id, function(err) {
        if (err) { return callback(err); }
      });
    });
    return callback(null);
  }

  // ユーザグループの関係性を削除
  userGroupRelationSchema.statics.removeById = function (id, callback) {
    var UserGroupRelation = this
    UserGroupRelation.findById(id, function (err, relationData) {
      debug(relationData);
      if (!relationData) {
        debug('Error on find a removing user-group-relation', err);
        return callback(err);
      }

      relationData.remove(function(err) {
        if (err) {
          return callback(err);
        }
        return callback(null);
      });
    });
  }

  userGroupRelationSchema.statics.PAGE_ITEMS         = PAGE_ITEMS;

  return mongoose.model('UserGroupRelation', userGroupRelationSchema);
};
