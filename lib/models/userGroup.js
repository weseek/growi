module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:userGroup')
    , mongoose = require('mongoose')
    , mongoosePaginate = require('mongoose-paginate')
    , uniqueValidator = require('mongoose-unique-validator')
    , ObjectId = mongoose.Schema.Types.ObjectId

    , USER_GROUP_PUBLIC_FIELDS = '_id image name createdAt'

    , PAGE_ITEMS = 50

    , userGroupSchema;

  userGroupSchema = new mongoose.Schema({
    userGroupId: String,
    image: String,
    name: { type: String, required: true, unique: true, index: true },
    createdAt: { type: Date, default: Date.now },
  });
  userGroupSchema.plugin(mongoosePaginate);
  userGroupSchema.plugin(uniqueValidator);


  // TBD: グループ画像の更新
  // userGroupSchema.methods.updateImage = function(image, callback) {
  //   this.image = image;
  //   this.save(function(err, userGroupData) {
  //     return callback(err, userGroupData);
  //   });
  // };

  // TBD: グループ画像の削除
  // userGroupSchema.methods.deleteImage = function(callback) {
  //   return this.updateImage(null, callback);
  // };

  // グループ公開情報のフィルター
  userGroupSchema.statics.filterToPublicFields = function(userGroup) {
    debug('UserGroup is', typeof userGroup, userGroup);
    if (typeof userGroup !== 'object' || !userGroup._id) {
      return userGroup;
    }

    var filteredGroup = {};
    var fields = USER_GROUP_PUBLIC_FIELDS.split(' ');
    for (var i = 0; i < fields.length; i++) {
      var key = fields[i];
      if (userGroup[key]) {
        filteredGroup[key] = userGroup[key];
      }
    }

    return filteredGroup;
  };

  // TBD: グループ検索
  // userGroupSchema.statics.findGroups = function(options, callback) {
  //   var sort = options.sort || {createdAt: 1};

  //   this.find()
  //     .sort(sort)
  //     .skip(options.skip || 0)
  //     .limit(options.limit || 21)
  //     .exec(function (err, userGroupData) {
  //       callback(err, userGroupData);
  //     });

  // };

  // すべてのグループを取得（オプション指定可）
  userGroupSchema.statics.findAllGroups = function(option) {
    debug('NoErrorOccured');

    var UserGroup = this;
    var option = option || {}
      , sort = option.sort || {createdAt: -1}
      , fields = option.fields || USER_GROUP_PUBLIC_FIELDS
      ;

    return new Promise(function(resolve, reject) {
      UserGroup
        .find()
        .select(fields)
        .sort(sort)
        .exec(function (err, userGroupData) {
          if (err) {
            return reject(err);
          }

          return resolve(userGroupData);
        });
    });
  };

  // TBD: IDによるグループ検索
  // userGroupSchema.statics.findGroupsByIds = function(ids, option) {
  //   var UserGroup = this;
  //   var option = option || {}
  //     , sort = option.sort || {createdAt: -1}
  //     , fields = option.fields || USER_GROUP_PUBLIC_FIELDS
  //     ;

  //   return new Promise(function(resolve, reject) {
  //     UserGroup
  //       .find({ _id: { $in: ids }})
  //       .select(fields)
  //       .sort(sort)
  //       .exec(function (err, userGroupData) {
  //         if (err) {
  //           return reject(err);
  //         }

  //         return resolve(userGroupData);
  //       });
  //   });
  // };

  // ページネーション利用のグループ検索
  userGroupSchema.statics.findUserGroupsWithPagination = function(options, callback) {
    var sort = options.sort || {name: 1, createdAt: 1};

    // return callback(err, null);
    this.paginate({ page: options.page || 1, limit: options.limit || PAGE_ITEMS }, function(err, result) {
      if (err) {
        debug('Error on pagination:', err);
        return callback(err, null);
      }

      return callback(err, result);
    }, { sortBy : sort });
  };

  // TBD: グループ名によるグループ検索
  // userGroupSchema.statics.findUserGroupByName = function(name) {
  //   var UserGroup = this;
  //   return new Promise(function(resolve, reject) {
  //     UserGroup.findOne({name: name}, function (err, userGroupData) {
  //       if (err) {
  //         return reject(err);
  //       }

  //       return resolve(userGroupData);
  //     });
  //   });
  // };

  // TBD: 登録可能グループ名確認
  // userGroupSchema.statics.isRegisterableName = function(name, callback) {
  //   var UserGroup = this;
  //   var userGroupnameUsable = true;

  //   this.findOne({name: name}, function (err, userGroupData) {
  //     if (userGroupData) {
  //       userGroupnameUsable = false;
  //     }
  //     return callback(userGroupnameUsable);
  //   });
  // };

  // TBD: グループの完全削除
  // userGroupSchema.statics.removeCompletelyById = function(id, callback) {
  //   var UserGroup = this;
  //   UserGroup.findById(id, function (err, userGroupData) {
  //     if (!userGroupData) {
  //       return callback(err, null);
  //     }

  //     debug('Removing userGroup:', userGroupData);

  //     userGroupData.remove(function(err) {
  //       if (err) {
  //         return callback(err, null);
  //       }

  //       return callback(null, 1);
  //     });
  //   });
  // };

  // TBD: グループ生成（名前が要る）
  userGroupSchema.statics.createGroupByName = function(name, callback) {
    var UserGroup = this
      , newUserGroup = new UserGroup();

    newUserGroup.name = name;
    newUserGroup.createdAt = Date.now();

    newUserGroup.save(function(err, userGroupData) {
      return callback(err, userGroupData);
    });
  };

  // TBD: グループ画像パスの生成
  // userGroupSchema.statics.createGroupPictureFilePath = function(userGroup, name) {
  //   var ext = '.' + name.match(/(.*)(?:\.([^.]+$))/)[2];

  //   return 'userGroup/' + userGroup._id + ext;
  // };


  userGroupSchema.statics.USER_GROUP_PUBLIC_FIELDS = USER_GROUP_PUBLIC_FIELDS;
  userGroupSchema.statics.PAGE_ITEMS         = PAGE_ITEMS;

  return mongoose.model('UserGroup', userGroupSchema);
};
