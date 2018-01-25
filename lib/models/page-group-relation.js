module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:pageGroupRelation')
    , mongoose = require('mongoose')
    , mongoosePaginate = require('mongoose-paginate')
    , ObjectId = mongoose.Schema.Types.ObjectId

    , PAGE_ITEMS = 50

    , pageGroupRelationSchema;

  pageGroupRelationSchema = new mongoose.Schema({
    pageGroupRelationId: String,
    relatedGroup: { type: ObjectId, ref: 'UserGroup' },
    targetPage: { type: ObjectId, ref: 'Page' },
    createdAt: { type: Date, default: Date.now },
  },{
    toJSON: { getters: true },
    toObject: { getters: true }
  });
  pageGroupRelationSchema.plugin(mongoosePaginate);

  // すべてのグループ所属関係を取得
  pageGroupRelationSchema.statics.findAllRelation = function() {
    debug('findAllRelations is called');
    var PageGroupRelation = this;

    return new Promise(function(resolve, reject) {
      PageGroupRelation
        .find({ relatedGroup: group} )
        .populate('targetPage')
        .exec(function (err, pageGroupRelationData) {
          if (err) {
            return reject(err);
          }

          return resolve(pageGroupRelationData);
        });
    });
  };

  // 指定グループに対するすべてのグループ所属関係を取得
  pageGroupRelationSchema.statics.findAllRelationForUserGroup = function (userGroup) {
    debug('findAllRelation is called', userGroup);
    var PageGroupRelation = this;

    return new Promise(function (resolve, reject) {
      PageGroupRelation
        .find({ relatedGroup: userGroup })
        .populate('targetPage')
        .exec(function (err, pageGroupRelationData) {
          if (err) {
            return reject(err);
          }
          return resolve(pageGroupRelationData);
        });
    });
  };

  // 指定グループリストに対するすべてのグループ所属関係を取得
  pageGroupRelationSchema.statics.findAllRelationForUserGroups = function (userGroups, callback) {
    debug('findAllRelations is called', userGroups);
    var PageGroupRelation = this;
    var groupRelations = new Map();

    return new Promise(function (resolve, reject) {
      PageGroupRelation
        .find({ relatedGroup: { $in: userGroups} })
        .populate('targetPage')
        .exec(function (err, pageGroupRelationData) {
          if (err) {
            return reject(err);
          }
          debug(pageGroupRelationData);
          return resolve(pageGroupRelationData);
        });
    });
  };

  // ページネーション利用の検索
  pageGroupRelationSchema.statics.findPageGroupRelationsWithPagination = function (userGroup, options, callback) {

    this.paginate({ relatedGroup: userGroup }, { page: options.page || 1, limit: options.limit || PAGE_ITEMS }, function(err, result) {
      if (err) {
        debug('Error on pagination:', err);
        return callback(err, null);
      }

      return callback(err, result);
    });
  };

  // 関係性の生成
  pageGroupRelationSchema.statics.createRelation = function(userGroup, user, callback) {
    var PageGroupRelation = this
      , newPageGroupRelation = new PageGroupRelation();

    if (userGroup == null || user == null) {
      return callback(new Error('userGroup or user is null'));
    }
    newPageGroupRelation.relatedGroup = userGroup;
    newPageGroupRelation.targetPage = user;
    newPageGroupRelation.createdAt = Date.now();

    debug('create new user-group-relation ', newPageGroupRelation);
    newPageGroupRelation.save(function(err, pageGroupRelationData) {
      return callback(err, pageGroupRelationData);
    });
  };

  // グループに紐づく関係性の全削除
  pageGroupRelationSchema.statics.removeAllByUserGroup = function (userGroup, callback) {

    if (userGroup === null || userGroup === undefined) { return callback(null); }
    var PageGroupRelation = this
    var relations = PageGroupRelation.findAllRelation(userGroup);

    // 関係性削除の実装
    relations.array.forEach(relation => {
      PageGroupRelation.removeById(relation.id, function(err) {
        if (err) { return callback(err); }
      });
    });
    return callback(null);
  }

  // ユーザグループの関係性を削除
  pageGroupRelationSchema.statics.removeById = function (id, callback) {
    var PageGroupRelation = this
    PageGroupRelation.findById(id, function (err, relationData) {
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

  pageGroupRelationSchema.statics.PAGE_ITEMS         = PAGE_ITEMS;

  return mongoose.model('PageGroupRelation', pageGroupRelationSchema);
};
