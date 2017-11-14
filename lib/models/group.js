module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:group')
    , mongoose = require('mongoose')
    , mongoosePaginate = require('mongoose-paginate')
    , uniqueValidator = require('mongoose-unique-validator')
    , crypto = require('crypto')
    , ObjectId = mongoose.Schema.Types.ObjectId

    , GROUP_PUBLIC_FIELDS = '_id image name groupname createdAt'

    , PAGE_ITEMS = 50

    , groupSchema;

  groupSchema = new mongoose.Schema({
    groupId: String,
    image: String,
    name: { type: String },
    groupname: { type: String, index: true },
    password: String,
    createdAt: { type: Date, default: Date.now },
  });
  groupSchema.plugin(mongoosePaginate);
  groupSchema.plugin(uniqueValidator);

  // TBD: 仮グループ管理パスワードの生成
  // function generateRandomTempPassword () {
  //   var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!=-_';
  //   var password = '';
  //   var len = 12;

  //   for (var i = 0; i < len; i++) {
  //     var randomPoz = Math.floor(Math.random() * chars.length);
  //     password += chars.substring(randomPoz, randomPoz+1);
  //   }

  //   return password;
  // }

  // TBD: グループ管理パスワードの生成
  // function generatePassword (password) {
  //   var hasher = crypto.createHash('sha256');
  //   hasher.update(crowi.env.PASSWORD_SEED + password);

  //   return hasher.digest('hex');
  // }

  // TBD: グループ管理パスワードの設定済確認
  // groupSchema.methods.isPasswordSet = function() {
  //   if (this.password) {
  //     return true;
  //   }
  //   return false;
  // };

  // TBD: グループ管理パスワードのバリデーション
  // groupSchema.methods.isPasswordValid = function(password) {
  //   return this.password == generatePassword(password);
  // };

  // TBD: グループ管理パスワードの設定
  // groupSchema.methods.setPassword = function(password) {
  //   this.password = generatePassword(password);
  //   return this;
  // };

  // グループ管理パスワードの更新
  // groupSchema.methods.updatePassword = function(password, callback) {
  //   this.setPassword(password);
  //   this.save(function(err, groupData) {
  //     return callback(err, groupData);
  //   });
  // };

  // TBD: グループ画像の更新
  // groupSchema.methods.updateImage = function(image, callback) {
  //   this.image = image;
  //   this.save(function(err, groupData) {
  //     return callback(err, groupData);
  //   });
  // };

  // TBD: グループ画像の削除
  // groupSchema.methods.deleteImage = function(callback) {
  //   return this.updateImage(null, callback);
  // };

  groupSchema.statics.filterToPublicFields = function(group) {
    debug('Group is', typeof group, group);
    if (typeof group !== 'object' || !group._id) {
      return group;
    }

    var filteredGroup = {};
    var fields = GROUP_PUBLIC_FIELDS.split(' ');
    for (var i = 0; i < fields.length; i++) {
      var key = fields[i];
      if (group[key]) {
        filteredGroup[key] = group[key];
      }
    }

    return filteredGroup;
  };

  // TBD: グループ検索
  // groupSchema.statics.findGroups = function(options, callback) {
  //   var sort = options.sort || {createdAt: 1};

  //   this.find()
  //     .sort(sort)
  //     .skip(options.skip || 0)
  //     .limit(options.limit || 21)
  //     .exec(function (err, groupData) {
  //       callback(err, groupData);
  //     });

  // };

  groupSchema.statics.findAllGroups = function(option) {
    var Group = this;
    var option = option || {}
      , sort = option.sort || {createdAt: -1}
      , fields = option.fields || GROUP_PUBLIC_FIELDS
      ;

    return new Promise(function(resolve, reject) {
      Group
        .find()
        .select(fields)
        .sort(sort)
        .exec(function (err, groupData) {
          if (err) {
            return reject(err);
          }

          return resolve(groupData);
        });
    });
  };

  // TBD: IDによるグループ検索
  // groupSchema.statics.findGroupsByIds = function(ids, option) {
  //   var Group = this;
  //   var option = option || {}
  //     , sort = option.sort || {createdAt: -1}
  //     , fields = option.fields || GROUP_PUBLIC_FIELDS
  //     ;

  //   return new Promise(function(resolve, reject) {
  //     Group
  //       .find({ _id: { $in: ids }})
  //       .select(fields)
  //       .sort(sort)
  //       .exec(function (err, groupData) {
  //         if (err) {
  //           return reject(err);
  //         }

  //         return resolve(groupData);
  //       });
  //   });
  // };

  groupSchema.statics.findGroupsWithPagination = function(options, callback) {
    var sort = options.sort || {groupname: 1, createdAt: 1};

    this.paginate({ page: options.page || 1, limit: options.limit || PAGE_ITEMS }, function(err, result) {
      if (err) {
        debug('Error on pagination:', err);
        return callback(err, null);
      }

      return callback(err, result);
    }, { sortBy : sort });
  };

  // TBD: グループ名によるグループ検索
  // groupSchema.statics.findGroupByGroupname = function(groupname) {
  //   var Group = this;
  //   return new Promise(function(resolve, reject) {
  //     Group.findOne({groupname: groupname}, function (err, groupData) {
  //       if (err) {
  //         return reject(err);
  //       }

  //       return resolve(groupData);
  //     });
  //   });
  // };

  // TBD: 登録可能グループ名確認
  // groupSchema.statics.isRegisterableGroupname = function(groupname, callback) {
  //   var Group = this;
  //   var groupnameUsable = true;

  //   this.findOne({groupname: groupname}, function (err, groupData) {
  //     if (groupData) {
  //       groupnameUsable = false;
  //     }
  //     return callback(groupnameUsable);
  //   });
  // };

  // TBD: グループの完全削除
  // groupSchema.statics.removeCompletelyById = function(id, callback) {
  //   var Group = this;
  //   Group.findById(id, function (err, groupData) {
  //     if (!groupData) {
  //       return callback(err, null);
  //     }

  //     debug('Removing group:', groupData);

  //     groupData.remove(function(err) {
  //       if (err) {
  //         return callback(err, null);
  //       }

  //       return callback(null, 1);
  //     });
  //   });
  // };

  // TBD: ランダム生成パスワードリセット
  // groupSchema.statics.resetPasswordByRandomString = function(id) {
  //   var Group = this;

  //   return new Promise(function(resolve, reject) {
  //     Group.findById(id, function (err, groupData) {
  //       if (!groupData) {
  //         return reject(new Error('Group not found'));
  //       }

  //       var newPassword = generateRandomTempPassword();
  //       groupData.setPassword(newPassword);
  //       groupData.save(function(err, groupData) {
  //         if (err) {
  //           return reject(err);
  //         }

  //         resolve({group: groupData, newPassword: newPassword});
  //       });
  //     });
  //   });
  // };

  // TBD: グループ名・パスワードによるグループ生成
  // groupSchema.statics.createGroupByNameAndPassword = function(name, groupname, password, callback) {
  //   var Group = this
  //     , newGroup = new Group();

  //   newGroup.name = name;
  //   newGroup.groupname = groupname;
  //   newGroup.setPassword(password);
  //   newGroup.createdAt = Date.now();

  //   newGroup.save(function(err, groupData) {
  //     return callback(err, groupData);
  //   });
  // };

  // TBD: グループ画像パスの生成
  // groupSchema.statics.createGroupPictureFilePath = function(group, name) {
  //   var ext = '.' + name.match(/(.*)(?:\.([^.]+$))/)[2];

  //   return 'group/' + group._id + ext;
  // };


  groupSchema.statics.GROUP_PUBLIC_FIELDS = GROUP_PUBLIC_FIELDS;
  groupSchema.statics.PAGE_ITEMS         = PAGE_ITEMS;

  return mongoose.model('Group', groupSchema);
};
