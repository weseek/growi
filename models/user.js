module.exports = function(app, models) {
  var mongoose = require('mongoose')
    , mongoosePaginate = require('mongoose-paginate')
    , debug = require('debug')('crowi:models:user')
    , crypto = require('crypto')
    , config = app.set('config')
    , ObjectId = mongoose.Schema.Types.ObjectId

    , STATUS_REGISTERED = 1
    , STATUS_ACTIVE     = 2
    , STATUS_SUSPENDED  = 3
    , STATUS_DELETED    = 4

    , PAGE_ITEMS        = 20

    , userSchema;

  userSchema = new mongoose.Schema({
    userId: String,
    fbId: String, // userId
    image: String,
    googleId: String,
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: String,
    status: { type: Number, required: true, default: STATUS_ACTIVE },
    createdAt: { type: Date, default: Date.now },
    admin: { type: Boolean, default: 0 }
  });
  userSchema.plugin(mongoosePaginate);

  function decideUserStatusOnRegistration () {
    // status decided depends on registrationMode
    switch (config.crowi['security:registrationMode']) {
      case 'Open':
        return STATUS_ACTIVE;
      case 'Restricted':
        return STATUS_REGISTERED;
      default:
        return STATUS_ACTIVE; // どっちにすんのがいいんだろうな
    }
  }

  function generatePassword (password) {
    var hasher = crypto.createHash('sha256');
    hasher.update(process.env.PASSWORD_SEED + password);

    return hasher.digest('hex');
  }

  userSchema.methods.isPasswordSet = function() {
    if (this.password) {
      return true;
    }
    return false;
  };

  userSchema.methods.isPasswordValid = function(password) {
    return this.password == generatePassword(password);
  };

  userSchema.methods.setPassword = function(password) {
    return this.password == generatePassword(password);
  };

  userSchema.methods.setPassword = function(password) {
    this.password = generatePassword(password);
    return this;
  };

  userSchema.methods.isEmailSet = function() {
    if (this.email) {
      return true;
    }
    return false;
  };

  userSchema.methods.update = function(name, email, callback) {
    this.name = name;
    this.email = email;
    this.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.methods.updatePassword = function(password, callback) {
    this.setPassword(password);
    this.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.methods.updateImage = function(image, callback) {
    this.image = image;
    this.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.methods.deleteImage = function(callback) {
    return this.updateImage(null, callback);
  };

  userSchema.methods.updateFacebookId = function(fbId, callback) {
    this.fbId = this.userId = fbId;
    this.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.methods.deleteFacebookId = function(callback) {
    return this.updateFacebookId(null, callback);
  };

  userSchema.methods.updateGoogleId = function(googleId, callback) {
    this.googleId = googleId;
    this.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.methods.deleteGoogleId = function(callback) {
    return this.updateGoogleId(null, callback);
  };


  userSchema.methods.removeFromAdmin = function(callback) {
    debug('Remove from admin', this);
    this.admin = 0;
    this.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.methods.makeAdmin = function(callback) {
    debug('Admin', this);
    this.admin = 1;
    this.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.methods.statusActivate = function(callback) {
    debug('Activate User', this);
    this.status = STATUS_ACTIVE;
    this.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.methods.statusSuspend = function(callback) {
    debug('Suspend User', this);
    this.status = STATUS_SUSPENDED;
    if (this.email === undefined || this.email === null) { // migrate old data
      this.email = '-';
    }
    if (this.name === undefined || this.name === null) { // migrate old data
      this.name = '-' + Date.now();
    }
    if (this.username === undefined || this.usename === null) { // migrate old data
      this.username = '-';
    }
    this.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.methods.statusDelete = function(callback) {
    debug('Delete User', this);
    this.status = STATUS_DELETED;
    this.password = '';
    this.email = 'deleted@deleted';
    this.googleId = null;
    this.fbId = null;
    this.image = null;
    this.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.methods.updateGoogleIdAndFacebookId = function(googleId, facebookId, callback) {
    this.googleId = googleId;
    this.fbId = this.userId = facebookId;
    this.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.statics.getUserStatusLabels = function() {
    var userStatus = {};
    userStatus[STATUS_REGISTERED] = '承認待ち';
    userStatus[STATUS_ACTIVE] = 'Active';
    userStatus[STATUS_SUSPENDED] = 'Suspended';
    userStatus[STATUS_DELETED] = 'Deleted';

    return userStatus;
  };

  userSchema.statics.isEmailValid = function(email, callback) {
    if (Array.isArray(config.crowi['security:registrationWhiteList'])) {
      return config.crowi['security:registrationWhiteList'].some(function(allowedEmail) {
        var re = new RegExp(allowedEmail + '$');
        return re.test(email);
      });
    }

    return true;
  };

  userSchema.statics.findUsers = function(options, callback) {
    var sort = options.sort || {status: 1, createdAt: 1};
    this.find()
      .sort(sort)
      .skip(options.skip || 0)
      .limit(options.limit || 21)
      .exec(function (err, userData) {
        callback(err, userData);
      });

  };

  userSchema.statics.findUsersWithPagination = function(options, callback) {
    var sort = options.sort || {status: 1, username: 1, createdAt: 1};

    this.paginate({}, options.page || 1, PAGE_ITEMS, function(err, pageCount, paginatedResults, itemCount) {
      if (err) {
        debug('Error on pagination:', err);
        return callback(err, null);
      }

      return callback(err, paginatedResults, pageCount, itemCount);
    }, { sortBy : sort });
  };

  userSchema.statics.findUserByUsername = function(username, callback) {
    this.findOne({username: username}, function (err, userData) {
      callback(err, userData);
    });
  };

  userSchema.statics.findUserByFacebookId = function(fbId, callback) {
    this.findOne({userId: fbId}, function (err, userData) {
      callback(err, userData);
    });
  };

  userSchema.statics.findUserByGoogleId = function(googleId, callback) {
    this.findOne({googleId: googleId}, function (err, userData) {
      callback(err, userData);
    });
  };

  userSchema.statics.findUserByEmailAndPassword = function(email, password, callback) {
    var hashedPassword = generatePassword(password);
    this.findOne({email: email, password: hashedPassword}, function (err, userData) {
      callback(err, userData);
    });
  };

  userSchema.statics.isRegisterable = function(email, username, callback) {
    var User = this;
    var emailUsable = true;
    var usernameUsable = true;

    // username check
    this.findOne({username: username}, function (err, userData) {
      if (userData) {
        usernameUsable = false;
      }

      // email check
      User.findOne({email: email}, function (err, userData) {
        if (userData) {
          emailUsable = false;
        }

        if (!emailUsable || !usernameUsable) {
          return callback(false, {email: emailUsable, username: usernameUsable});
        }

        return callback(true, {});
      });
    });
  };

  userSchema.statics.createUserByEmailAndPassword = function(name, username, email, password, callback) {
    var User = this
      , newUser = new User();

    newUser.name = name;
    newUser.username = username;
    newUser.email = email;
    newUser.setPassword(password);
    newUser.createdAt = Date.now();
    newUser.status = decideUserStatusOnRegistration();

    newUser.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.statics.createUserByFacebook = function(fbUserInfo, callback) {
    var User = this
      , newUser = new User();

    newUser.userId = fbUserInfo.id;
    newUser.image = '//graph.facebook.com/' + fbUserInfo.id + '/picture?size=square';
    newUser.name = fbUserInfo.name || '';
    newUser.username = fbUserInfo.username || '';
    newUser.email = fbUserInfo.email || '';
    newUser.createdAt = Date.now();
    newUser.status = decideUserStatusOnRegistration();

    newUser.save(function(err, userData) {
      return callback(err, userData);
    });
  };

  userSchema.statics.createUserPictureFilePath = function(user, name) {
    var ext = '.' + name.match(/(.*)(?:\.([^.]+$))/)[2];

    return 'user/' + user._id + ext;
  };


  userSchema.statics.STATUS_REGISTERED = STATUS_REGISTERED;
  userSchema.statics.STATUS_ACTIVE = STATUS_ACTIVE;
  userSchema.statics.STATUS_SUSPENDED = STATUS_SUSPENDED;
  userSchema.statics.STATUS_DELETED = STATUS_DELETED;

  models.User = mongoose.model('User', userSchema);

  return models.User;
};
