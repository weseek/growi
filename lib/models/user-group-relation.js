module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:userGroupRelation')
    , mongoose = require('mongoose')
    , mongoosePaginate = require('mongoose-paginate')
    , ObjectId = mongoose.Schema.Types.ObjectId

    , PAGE_ITEMS = 50

    , userGroupRelationSchema;

  userGroupRelationSchema = new mongoose.Schema({
    userGroupRelationId: String,
    relatedGroup: { type: ObjectId, ref: 'UserGroup', required: true },
    relatedUser: { type: ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },{
    toJSON: { getters: true },
    toObject: { getters: true }
  });
  userGroupRelationSchema.plugin(mongoosePaginate);

  // すべてのグループ所属関係を取得
  userGroupRelationSchema.statics.findAllRelation = function() {
    debug('findAllRelations is called');
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

  // 指定グループに対するすべてのグループ所属関係を取得
  userGroupRelationSchema.statics.findAllRelationForUserGroup = function (userGroup) {
    debug('findAllRelationForUserGroup is called', userGroup);
    var UserGroupRelation = this;

    return new Promise(function (resolve, reject) {
      UserGroupRelation
        .find({ relatedGroup: userGroup })
        .populate('relatedUser')
        .exec(function (err, userGroupRelationData) {
          if (err) {
            return reject(err);
          }
          return resolve(userGroupRelationData);
        });
    });
  };

  // 指定ユーザが所属するすべてのグループ所属関係を取得
  userGroupRelationSchema.statics.findAllRelationForUser = function (user) {
    debug('findAllRelationForUser is called');
    var UserGroupRelation = this;

    return new Promise(function (resolve, reject) {
      UserGroupRelation
        .find({ relatedUser: user.id })
        .populate('relatedGroup')
        .exec(function (err, userGroupRelationData) {
          if (err) {
            return reject(err);
          }
          return resolve(userGroupRelationData);
        });
    });
  };

  // 指定グループリストに対するすべてのグループ所属関係を取得
  userGroupRelationSchema.statics.findAllRelationForUserGroups = function (userGroups, callback) {
    debug('findAllRelations is called', userGroups);
    var UserGroupRelation = this;
    var groupRelations = new Map();

    return new Promise(function (resolve, reject) {
      UserGroupRelation
        .find({ relatedGroup: { $in: userGroups} })
        .populate('relatedUser')
        .exec(function (err, userGroupRelationData) {
          if (err) {
            return reject(err);
          }
          debug(userGroupRelationData);
          return resolve(userGroupRelationData);
        });
    });
  };

  // ページネーション利用の検索
  userGroupRelationSchema.statics.findUserGroupRelationsWithPagination = function (userGroup, options, callback) {

    this.paginate({ relatedGroup: userGroup }, { page: options.page || 1, limit: options.limit || PAGE_ITEMS }, function(err, result) {
      if (err) {
        debug('Error on pagination:', err);
        return callback(err, null);
      }

      return callback(err, result);
    });
  };

  // グループのIDとユーザのIDから関係性を取得
  userGroupRelationSchema.statics.findByGroupIdAndUser = function (userGroupId, userData, callback) {
    var UserGroupRelation = this;

    return new Promise(function (resolve, reject) {
      UserGroupRelation
        .findOne({ relatedGroup: userGroupId, relatedUser: userData.id })
        .populate('relatedUser')
        .populate('relatedGroup')
        .exec(function (err, userGroupRelationData) {
          if (err) {
            return reject(err);
          }
          debug(userGroupRelationData);
          return resolve(userGroupRelationData);
        });
    });
  }

  // グループとユーザを指定し、関係性が存在するかチェック
  userGroupRelationSchema.statics.checkIsRelatedUserForGroup = function (userData, userGroup) {
    var UserGroupRelation = this;

    debug('checkIsRelatedUserForGroup is called.', userData, userGroup);

    return new Promise(function (resolve, reject) {
      UserGroupRelation.count( {relatedGroup: userGroup.id, relatedUser: userData.id}, function (err, count) {
      if (err) {
        debug('An Error occured.', err);
        return reject(err);
      }
      debug('checkIsRelatedUserForGroup count : ', count);
      return resolve((0 < count));
      });
    });
  };

  // 関係性の生成
  userGroupRelationSchema.statics.createRelation = function(userGroup, user, callback) {
    var UserGroupRelation = this
      , newUserGroupRelation = new UserGroupRelation();

    if (userGroup == null || user == null) {
      return callback(new Error('userGroup or user is null'));
    }
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
      if (err) {
        debug('Error on find a removing user-group-relation', err);
        return callback(err);
      }
      debug('relationData is ', relationData);
      if (relationData == null || relationData == undefined) {
        debug('Cannot find user group relation by id', id);
        return callback(new Error('Cannot find user group relation by id'));
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
