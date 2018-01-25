module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:userGroup')
    , mongoose = require('mongoose')
    , mongoosePaginate = require('mongoose-paginate')
    , ObjectId = mongoose.Schema.Types.ObjectId

    , USER_GROUP_PUBLIC_FIELDS = '_id image name createdAt'

    , PAGE_ITEMS = 10

    , userGroupSchema;

  userGroupSchema = new mongoose.Schema({
    userGroupId: String,
    image: String,
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
  });
  userGroupSchema.plugin(mongoosePaginate);


  // グループ画像の更新
  userGroupSchema.methods.updateImage = function(image, callback) {
    this.image = image;
    this.save(function(err, userGroupData) {
      return callback(err, userGroupData);
    });
  };

  // グループ画像の削除
  userGroupSchema.methods.deleteImage = function(callback) {
    return this.updateImage(null, callback);
  };

  // グループ画像パスの生成
  userGroupSchema.statics.createUserGroupPictureFilePath = function (userGroup, name) {
    var ext = '.' + name.match(/(.*)(?:\.([^.]+$))/)[2];

    return 'userGroup/' + userGroup._id + ext;
  };

  // すべてのグループを取得（オプション指定可）
  userGroupSchema.statics.findAllGroups = function(option) {
    var UserGroup = this;

    return new Promise(function(resolve, reject) {
      UserGroup
        .find()
        .exec(function (err, userGroupData) {
          if (err) {
            return reject(err);
          }

          return resolve(userGroupData);
        });
    });
  };

  // ページネーション利用のグループ検索
  userGroupSchema.statics.findUserGroupsWithPagination = function(options, callback) {
    var sort = options.sort || {name: 1, createdAt: 1};

    this.paginate({}, { page: options.page || 1, limit: options.limit || PAGE_ITEMS }, function(err, result) {
      if (err) {
        debug('Error on pagination:', err);
        return callback(err, null);
      }

      return callback(err, result);
    }, { sortBy : sort });
  };

  // TBD: グループ名によるグループ検索
  userGroupSchema.statics.findUserGroupByName = function(name) {
    var UserGroup = this;
    return new Promise(function(resolve, reject) {
      UserGroup.findOne({name: name}, function (err, userGroupData) {
        if (err) {
          return reject(err);
        }

        return resolve(userGroupData);
      });
    });
  };

  // 登録可能グループ名確認
  userGroupSchema.statics.isRegisterableName = function(name, callback) {
    var UserGroup = this;
    var userGroupnameUsable = true;

    this.findOne({name: name}, function (err, userGroupData) {
      if (userGroupData) {
        debug(userGroupData);
        userGroupnameUsable = false;
      }
      return callback(userGroupnameUsable);
    });
  };

  // グループの完全削除
  userGroupSchema.statics.removeCompletelyById = function(id, callback) {
    var UserGroup = this;
    UserGroup.findById(id, function (err, userGroupData) {
      if (!userGroupData) {
        return callback(err, null);
      }

      debug('Removing userGroup:', userGroupData);

      userGroupData.remove(function(err) {
        if (err) {
          return callback(err, null);
        }

        return callback(null, 1);
      });
    });
  };

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

  // グループ名の更新
  userGroupSchema.methods.updateName = function(name, callback) {
    // 名前を設定して更新
    this.name = name;
    this.save(function (err, userGroupData) {
      return callback(err, this.name);
    });
  };

  // userGroupSchema.statics.USER_GROUP_PUBLIC_FIELDS = USER_GROUP_PUBLIC_FIELDS;
  userGroupSchema.statics.PAGE_ITEMS         = PAGE_ITEMS;

  return mongoose.model('UserGroup', userGroupSchema);
};
