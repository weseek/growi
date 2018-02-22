module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:pageGroupRelation')
    , mongoose = require('mongoose')
    , mongoosePaginate = require('mongoose-paginate')
    , ObjectId = mongoose.Schema.Types.ObjectId

    , PAGE_ITEMS = 50

    , pageGroupRelationSchema;

  pageGroupRelationSchema = new mongoose.Schema({
    pageGroupRelationId: String,
    relatedGroup: { type: ObjectId, ref: 'UserGroup', required: true },
    targetPage: { type: ObjectId, ref: 'Page', required: true },
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

    return PageGroupRelation.find({ relatedGroup: group} )
        .populate('targetPage')
        .exec();
  };

  // 指定グループに対するすべてのグループ所属関係を取得
  pageGroupRelationSchema.statics.findAllRelationForUserGroup = function (userGroup) {
    debug('findAllRelation is called', userGroup);
    var PageGroupRelation = this;

    return PageGroupRelation.find({ relatedGroup: userGroup.id })
        .populate('targetPage')
        .exec();
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

  // ページとグループを元に関係性が存在するか確認
  pageGroupRelationSchema.statics.isExistsRelationForPageAndGroup = function (page, userGroup) {
    var PageGroupRelation = this

    return new Promise(function (resolve, reject) {
      PageGroupRelation
        .count({ targetPage: page.id, relatedGroup: userGroup.id })
        .exec(function (err, count) {
          if (err) {
            return reject(err);
          }
          return resolve(0 < count);
        });
    });
  };

  // ページを元に関係性を取得
  pageGroupRelationSchema.statics.findByPage = function(page) {
    var PageGroupRelation = this

    return PageGroupRelation.find({ targetPage: page.id })
        .populate('relatedGroup')
        .exec();
  };

  // 関係性の生成
  pageGroupRelationSchema.statics.createRelation = function(userGroup, page) {
    var PageGroupRelation = this
      , newPageGroupRelation = new PageGroupRelation();

    debug('create new page-group-relation for group ', userGroup);
    newPageGroupRelation.relatedGroup = userGroup.id;
    newPageGroupRelation.targetPage = page.id;
    newPageGroupRelation.createdAt = Date.now();

    debug('create new page-group-relation ', newPageGroupRelation);
    return newPageGroupRelation.save();
  };

  // グループに紐づく関係性の全削除
  pageGroupRelationSchema.statics.removeAllByUserGroup = function (userGroup) {
    var PageGroupRelation = this

    return PageGroupRelation.findAllRelationForUserGroup(userGroup)
      .then( function(relations) {
        if (relations == null) {
          resolve();
        }
        else {
          relations.map(relation => relation.remove());
        }
      })
  }

  // ページに紐づく関係性の全削除
  pageGroupRelationSchema.statics.removeAllByPage = function (page) {
    var PageGroupRelation = this
    debug('removeAllByPage is called', page);

    return PageGroupRelation.findByPage(page)
    .then(function(relations) {
      debug('remove relations are ', relations);
      if (relations == null) {
        resolve();
      }
      else {
        relations.map(relation => relation.remove());
      }
    });
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
