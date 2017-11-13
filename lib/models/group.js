module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:group')
    , mongoose = require('mongoose')
    , mongoosePaginate = require('mongoose-paginate')
    , uniqueValidator = require('mongoose-unique-validator')
    , crypto = require('crypto')
    , async = require('async')
    , ObjectId = mongoose.Schema.Types.ObjectId

    , PAGE_ITEMS = 50

    , groupEvent = crowi.event('group')

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

  groupEvent.on('activated', groupEvent.onActivated);

  function generateRandomTempPassword () {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!=-_';
    var password = '';
    var len = 12;

    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomPoz, randomPoz+1);
    }

    return password;
  }

  function generatePassword (password) {
    var hasher = crypto.createHash('sha256');
    hasher.update(crowi.env.PASSWORD_SEED + password);

    return hasher.digest('hex');
  }

  groupSchema.methods.isPasswordSet = function() {
    if (this.password) {
      return true;
    }
    return false;
  };

  groupSchema.methods.isPasswordValid = function(password) {
    return this.password == generatePassword(password);
  };

  groupSchema.methods.setPassword = function(password) {
    this.password = generatePassword(password);
    return this;
  };

  groupSchema.methods.updatePassword = function(password, callback) {
    this.setPassword(password);
    this.save(function(err, groupData) {
      return callback(err, groupData);
    });
  };

  groupSchema.methods.updateImage = function(image, callback) {
    this.image = image;
    this.save(function(err, groupData) {
      return callback(err, groupData);
    });
  };

  groupSchema.methods.deleteImage = function(callback) {
    return this.updateImage(null, callback);
  };

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

  groupSchema.statics.findGroups = function(options, callback) {
    var sort = options.sort || {status: 1, createdAt: 1};

    this.find()
      .sort(sort)
      .skip(options.skip || 0)
      .limit(options.limit || 21)
      .exec(function (err, groupData) {
        callback(err, groupData);
      });

  };

  groupSchema.statics.findAllGroups = function(option) {
    var Group = this;
    var option = option || {}
      , sort = option.sort || {createdAt: -1}
      , status = option.status || [STATUS_ACTIVE, STATUS_SUSPENDED]
      , fields = option.fields || GROUP_PUBLIC_FIELDS
      ;

    if (!Array.isArray(status)) {
      status = [status];
    }

    return new Promise(function(resolve, reject) {
      Group
        .find()
        .or(status.map(s => { return {status: s}; }))
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

  groupSchema.statics.findGroupsByIds = function(ids, option) {
    var Group = this;
    var option = option || {}
      , sort = option.sort || {createdAt: -1}
      , status = option.status || STATUS_ACTIVE
      , fields = option.fields || GROUP_PUBLIC_FIELDS
      ;


    return new Promise(function(resolve, reject) {
      Group
        .find({ _id: { $in: ids }, status: status })
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

  groupSchema.statics.findAdmins = function(callback) {
    var Group = this;
    this.find({admin: true})
      .exec(function(err, admins) {
        debug('Admins: ', admins);
        callback(err, admins);
      });
  };

  groupSchema.statics.findGroupsWithPagination = function(options, callback) {
    var sort = options.sort || {status: 1, groupname: 1, createdAt: 1};

    this.paginate({status: { $ne: STATUS_DELETED }}, { page: options.page || 1, limit: options.limit || PAGE_ITEMS }, function(err, result) {
      if (err) {
        debug('Error on pagination:', err);
        return callback(err, null);
      }

      return callback(err, result);
    }, { sortBy : sort });
  };

  groupSchema.statics.findGroupByGroupname = function(groupname) {
    var Group = this;
    return new Promise(function(resolve, reject) {
      Group.findOne({groupname: groupname}, function (err, groupData) {
        if (err) {
          return reject(err);
        }

        return resolve(groupData);
      });
    });
  };

  groupSchema.statics.isRegisterableGroupname = function(groupname, callback) {
    var Group = this;
    var groupnameUsable = true;

    this.findOne({groupname: groupname}, function (err, groupData) {
      if (groupData) {
        groupnameUsable = false;
      }
      return callback(groupnameUsable);
    });
  };

  groupSchema.statics.removeCompletelyById = function(id, callback) {
    var Group = this;
    Group.findById(id, function (err, groupData) {
      if (!groupData) {
        return callback(err, null);
      }

      debug('Removing group:', groupData);

      groupData.remove(function(err) {
        if (err) {
          return callback(err, null);
        }

        return callback(null, 1);
      });
    });
  };

  groupSchema.statics.resetPasswordByRandomString = function(id) {
    var Group = this;

    return new Promise(function(resolve, reject) {
      Group.findById(id, function (err, groupData) {
        if (!groupData) {
          return reject(new Error('Group not found'));
        }

        var newPassword = generateRandomTempPassword();
        groupData.setPassword(newPassword);
        groupData.save(function(err, groupData) {
          if (err) {
            return reject(err);
          }

          resolve({group: groupData, newPassword: newPassword});
        });
      });
    });
  };

  groupSchema.statics.createGroupByNameAndPassword = function(name, groupname, password, callback) {
    var Group = this
      , newGroup = new Group();

    newGroup.name = name;
    newGroup.groupname = groupname;
    newGroup.setPassword(password);
    newGroup.createdAt = Date.now();

    newGroup.save(function(err, groupData) {
      return callback(err, groupData);
    });
  };

  groupSchema.statics.createGroupPictureFilePath = function(group, name) {
    var ext = '.' + name.match(/(.*)(?:\.([^.]+$))/)[2];

    return 'group/' + group._id + ext;
  };

  groupSchema.statics.getGroupnameByPath = function(path) {
    var groupname = null;
    if (m = path.match(/^\/group\/([^\/]+)\/?/)) {
      groupname = m[1];
    }

    return groupname;
  };


  groupSchema.statics.GROUP_PUBLIC_FIELDS = GROUP_PUBLIC_FIELDS;
  groupSchema.statics.PAGE_ITEMS         = PAGE_ITEMS;

  return mongoose.model('Group', groupSchema);
};
