/* eslint-disable no-use-before-define */

const debug = require('debug')('growi:models:user');
const logger = require('@alias/logger')('growi:models:user');
const path = require('path');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('mongoose-paginate');

const ObjectId = mongoose.Schema.Types.ObjectId;
const crypto = require('crypto');
const async = require('async');

module.exports = function(crowi) {
  const STATUS_REGISTERED = 1;
  const STATUS_ACTIVE = 2;
  const STATUS_SUSPENDED = 3;
  const STATUS_DELETED = 4;
  const STATUS_INVITED = 5;
  const USER_PUBLIC_FIELDS = '_id image isEmailPublished isGravatarEnabled googleId name username email introduction status lang createdAt admin';
  const IMAGE_POPULATION = { path: 'imageAttachment', select: 'filePathProxied' };

  const LANG_EN = 'en';
  const LANG_EN_US = 'en-US';
  const LANG_EN_GB = 'en-GB';
  const LANG_JA = 'ja';

  const PAGE_ITEMS = 50;

  let userEvent;

  // init event
  if (crowi != null) {
    userEvent = crowi.event('user');
    userEvent.on('activated', userEvent.onActivated);
  }

  const userSchema = new mongoose.Schema({
    userId: String,
    image: String,
    imageAttachment: { type: ObjectId, ref: 'Attachment' },
    isGravatarEnabled: { type: Boolean, default: false },
    isEmailPublished: { type: Boolean, default: true },
    googleId: String,
    name: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    // === The official settings
    // username: { type: String, index: true },
    // email: { type: String, required: true, index: true },
    // === crowi-plus (>= 2.1.0, <2.3.0) settings
    // email: { type: String, required: true, unique: true },
    introduction: { type: String },
    password: String,
    apiToken: String,
    lang: {
      type: String,
      // eslint-disable-next-line no-eval
      enum: Object.keys(getLanguageLabels()).map((k) => { return eval(k) }),
      default: LANG_EN_US,
    },
    status: {
      type: Number, required: true, default: STATUS_ACTIVE, index: true,
    },
    createdAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date },
    admin: { type: Boolean, default: 0, index: true },
  });
  userSchema.plugin(mongoosePaginate);
  userSchema.plugin(uniqueValidator);

  function validateCrowi() {
    if (crowi == null) {
      throw new Error('"crowi" is null. Init User model with "crowi" argument first.');
    }
  }

  function decideUserStatusOnRegistration() {
    validateCrowi();

    const Config = crowi.model('Config');


    const config = crowi.getConfig();

    if (!config.crowi) {
      return STATUS_ACTIVE; // is this ok?
    }

    // status decided depends on registrationMode
    switch (config.crowi['security:registrationMode']) {
      case Config.SECURITY_REGISTRATION_MODE_OPEN:
        return STATUS_ACTIVE;
      case Config.SECURITY_REGISTRATION_MODE_RESTRICTED:
      case Config.SECURITY_REGISTRATION_MODE_CLOSED: // 一応
        return STATUS_REGISTERED;
      default:
        return STATUS_ACTIVE; // どっちにすんのがいいんだろうな
    }
  }

  function generateRandomEmail() {
    const randomstr = generateRandomTempPassword();
    return `change-it-${randomstr}@example.com`;
  }

  function generateRandomTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!=-_';
    let password = '';
    const len = 12;

    for (let i = 0; i < len; i++) {
      const randomPoz = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomPoz, randomPoz + 1);
    }

    return password;
  }

  function generatePassword(password) {
    validateCrowi();

    const hasher = crypto.createHash('sha256');
    hasher.update(crowi.env.PASSWORD_SEED + password);

    return hasher.digest('hex');
  }

  function generateApiToken(user) {
    const hasher = crypto.createHash('sha256');
    hasher.update((new Date()).getTime() + user._id);

    return hasher.digest('base64');
  }

  function getLanguageLabels() {
    const lang = {};
    lang.LANG_EN = LANG_EN;
    lang.LANG_EN_US = LANG_EN_US;
    lang.LANG_EN_GB = LANG_EN_GB;
    lang.LANG_JA = LANG_JA;

    return lang;
  }

  userSchema.methods.populateImage = async function() {
    // eslint-disable-next-line no-return-await
    return await this.populate(IMAGE_POPULATION);
  };

  userSchema.methods.isPasswordSet = function() {
    if (this.password) {
      return true;
    }
    return false;
  };

  userSchema.methods.isPasswordValid = function(password) {
    return this.password === generatePassword(password);
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

  userSchema.methods.updateLastLoginAt = function(lastLoginAt, callback) {
    this.lastLoginAt = lastLoginAt;
    this.save((err, userData) => {
      return callback(err, userData);
    });
  };

  userSchema.methods.updateIsGravatarEnabled = function(isGravatarEnabled, callback) {
    this.isGravatarEnabled = isGravatarEnabled;
    this.save((err, userData) => {
      return callback(err, userData);
    });
  };

  userSchema.methods.updateIsEmailPublished = function(isEmailPublished, callback) {
    this.isEmailPublished = isEmailPublished;
    this.save((err, userData) => {
      return callback(err, userData);
    });
  };

  userSchema.methods.updatePassword = function(password, callback) {
    this.setPassword(password);
    this.save((err, userData) => {
      return callback(err, userData);
    });
  };

  userSchema.methods.canDeleteCompletely = function(creatorId) {
    const pageCompleteDeletionAuthority = crowi.configManager.getConfig('crowi', 'security:pageCompleteDeletionAuthority');
    if (pageCompleteDeletionAuthority == null || this.admin) {
      return true;
    }
    if (pageCompleteDeletionAuthority === 'adminAndAuthor') {
      return (this._id.equals(creatorId));
    }

    return false;
  };

  userSchema.methods.updateApiToken = function(callback) {
    const self = this;

    self.apiToken = generateApiToken(this);
    return new Promise(((resolve, reject) => {
      self.save((err, userData) => {
        if (err) {
          return reject(err);
        }

        return resolve(userData);
      });
    }));
  };

  userSchema.methods.updateImage = async function(attachment) {
    this.imageAttachment = attachment;
    return this.save();
  };

  userSchema.methods.deleteImage = async function() {
    validateCrowi();
    const Attachment = crowi.model('Attachment');

    // the 'image' field became DEPRECATED in v3.3.8
    this.image = undefined;

    if (this.imageAttachment != null) {
      Attachment.removeWithSubstance(this.imageAttachment._id);
    }

    this.imageAttachment = undefined;
    return this.save();
  };

  userSchema.methods.updateGoogleId = function(googleId, callback) {
    this.googleId = googleId;
    this.save((err, userData) => {
      return callback(err, userData);
    });
  };

  userSchema.methods.deleteGoogleId = function(callback) {
    return this.updateGoogleId(null, callback);
  };

  userSchema.methods.activateInvitedUser = async function(username, name, password) {
    this.setPassword(password);
    this.name = name;
    this.username = username;
    this.status = STATUS_ACTIVE;

    this.save((err, userData) => {
      userEvent.emit('activated', userData);
      if (err) {
        throw new Error(err);
      }
      return userData;
    });
  };

  userSchema.methods.removeFromAdmin = function(callback) {
    debug('Remove from admin', this);
    this.admin = 0;
    this.save((err, userData) => {
      return callback(err, userData);
    });
  };

  userSchema.methods.makeAdmin = function(callback) {
    debug('Admin', this);
    this.admin = 1;
    this.save((err, userData) => {
      return callback(err, userData);
    });
  };

  userSchema.methods.asyncMakeAdmin = async function(callback) {
    this.admin = 1;
    return this.save();
  };

  userSchema.methods.statusActivate = function(callback) {
    debug('Activate User', this);
    this.status = STATUS_ACTIVE;
    this.save((err, userData) => {
      userEvent.emit('activated', userData);
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
      this.name = `-${Date.now()}`;
    }
    if (this.username === undefined || this.usename === null) { // migrate old data
      this.username = '-';
    }
    this.save((err, userData) => {
      return callback(err, userData);
    });
  };

  userSchema.methods.statusDelete = function(callback) {
    debug('Delete User', this);

    const now = new Date();
    const deletedLabel = `deleted_at_${now.getTime()}`;

    this.status = STATUS_DELETED;
    this.username = deletedLabel;
    this.password = '';
    this.name = '';
    this.email = `${deletedLabel}@deleted`;
    this.googleId = null;
    this.isGravatarEnabled = false;
    this.image = null;
    this.save((err, userData) => {
      return callback(err, userData);
    });
  };

  userSchema.methods.updateGoogleId = function(googleId, callback) {
    this.googleId = googleId;
    this.save((err, userData) => {
      return callback(err, userData);
    });
  };

  userSchema.statics.getLanguageLabels = getLanguageLabels;
  userSchema.statics.getUserStatusLabels = function() {
    const userStatus = {};
    userStatus[STATUS_REGISTERED] = '承認待ち';
    userStatus[STATUS_ACTIVE] = 'Active';
    userStatus[STATUS_SUSPENDED] = 'Suspended';
    userStatus[STATUS_DELETED] = 'Deleted';
    userStatus[STATUS_INVITED] = '招待済み';

    return userStatus;
  };

  userSchema.statics.isEmailValid = function(email, callback) {
    validateCrowi();

    const config = crowi.getConfig();
    const whitelist = config.crowi['security:registrationWhiteList'];

    if (Array.isArray(whitelist) && whitelist.length > 0) {
      return config.crowi['security:registrationWhiteList'].some((allowedEmail) => {
        const re = new RegExp(`${allowedEmail}$`);
        return re.test(email);
      });
    }

    return true;
  };

  userSchema.statics.filterToPublicFields = function(user) {
    debug('User is', typeof user, user);
    if (typeof user !== 'object' || !user._id) {
      return user;
    }

    const filteredUser = {};
    const fields = USER_PUBLIC_FIELDS.split(' ');
    for (let i = 0; i < fields.length; i++) {
      const key = fields[i];
      if (user[key]) {
        filteredUser[key] = user[key];
      }
    }

    return filteredUser;
  };

  userSchema.statics.findUsers = function(options, callback) {
    const sort = options.sort || { status: 1, createdAt: 1 };

    this.find()
      .sort(sort)
      .skip(options.skip || 0)
      .limit(options.limit || 21)
      .exec((err, userData) => {
        callback(err, userData);
      });
  };

  userSchema.statics.findAllUsers = function(option) {
    // eslint-disable-next-line no-param-reassign
    option = option || {};

    const sort = option.sort || { createdAt: -1 };
    const fields = option.fields || USER_PUBLIC_FIELDS;

    let status = option.status || [STATUS_ACTIVE, STATUS_SUSPENDED];
    if (!Array.isArray(status)) {
      status = [status];
    }

    return this.find()
      .or(status.map((s) => { return { status: s } }))
      .select(fields)
      .sort(sort);
  };

  userSchema.statics.findUsersByIds = function(ids, option) {
    // eslint-disable-next-line no-param-reassign
    option = option || {};

    const sort = option.sort || { createdAt: -1 };
    const status = option.status || STATUS_ACTIVE;
    const fields = option.fields || USER_PUBLIC_FIELDS;

    return this.find({ _id: { $in: ids }, status })
      .select(fields)
      .sort(sort);
  };

  userSchema.statics.findAdmins = function(callback) {
    this.find({ admin: true })
      .exec((err, admins) => {
        debug('Admins: ', admins);
        callback(err, admins);
      });
  };

  userSchema.statics.findUsersWithPagination = async function(options) {
    const sort = options.sort || { status: 1, username: 1, createdAt: 1 };

    // eslint-disable-next-line no-return-await
    return await this.paginate({ status: { $ne: STATUS_DELETED } }, { page: options.page || 1, limit: options.limit || PAGE_ITEMS }, (err, result) => {
      if (err) {
        debug('Error on pagination:', err);
        throw new Error(err);
      }

      return result;
    }, { sortBy: sort });
  };

  userSchema.statics.findUsersByPartOfEmail = function(emailPart, options) {
    const status = options.status || null;
    const emailPartRegExp = new RegExp(emailPart.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const User = this;

    return new Promise((resolve, reject) => {
      const query = User.find({ email: emailPartRegExp }, USER_PUBLIC_FIELDS);

      if (status) {
        query.and({ status });
      }

      query
        .limit(PAGE_ITEMS + 1)
        .exec((err, userData) => {
          if (err) {
            return reject(err);
          }

          return resolve(userData);
        });
    });
  };


  userSchema.statics.findUserByUsername = function(username) {
    if (username == null) {
      return Promise.resolve(null);
    }
    return this.findOne({ username });
  };

  userSchema.statics.findUserByApiToken = function(apiToken) {
    if (apiToken == null) {
      return Promise.resolve(null);
    }
    return this.findOne({ apiToken });
  };

  userSchema.statics.findUserByGoogleId = function(googleId, callback) {
    if (googleId == null) {
      callback(null, null);
    }
    this.findOne({ googleId }, (err, userData) => {
      callback(err, userData);
    });
  };

  userSchema.statics.findUserByUsernameOrEmail = function(usernameOrEmail, password, callback) {
    this.findOne()
      .or([
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ])
      .exec((err, userData) => {
        callback(err, userData);
      });
  };

  userSchema.statics.findUserByEmailAndPassword = function(email, password, callback) {
    const hashedPassword = generatePassword(password);
    this.findOne({ email, password: hashedPassword }, (err, userData) => {
      callback(err, userData);
    });
  };

  userSchema.statics.isUserCountExceedsUpperLimit = async function() {
    const Config = crowi.model('Config');
    const userUpperLimit = Config.userUpperLimit(crowi);
    if (userUpperLimit === 0) {
      return false;
    }

    const activeUsers = await this.countListByStatus(STATUS_ACTIVE);
    if (userUpperLimit !== 0 && userUpperLimit <= activeUsers) {
      return true;
    }

    return false;
  };

  userSchema.statics.countListByStatus = async function(status) {
    const User = this;
    const conditions = { status };

    // TODO count は非推奨。mongoose のバージョンアップ後に countDocuments に変更する。
    return User.count(conditions);
  };

  userSchema.statics.isRegisterableUsername = async function(username) {
    let usernameUsable = true;

    const userData = await this.findOne({ username });
    if (userData) {
      usernameUsable = false;
    }
    return usernameUsable;
  };

  userSchema.statics.isRegisterable = function(email, username, callback) {
    const User = this;
    let emailUsable = true;
    let usernameUsable = true;

    // username check
    this.findOne({ username }, (err, userData) => {
      if (userData) {
        usernameUsable = false;
      }

      // email check
      User.findOne({ email }, (err, userData) => {
        if (userData) {
          emailUsable = false;
        }

        if (!emailUsable || !usernameUsable) {
          return callback(false, { email: emailUsable, username: usernameUsable });
        }

        return callback(true, {});
      });
    });
  };

  userSchema.statics.removeCompletelyById = function(id, callback) {
    const User = this;
    User.findById(id, (err, userData) => {
      if (!userData) {
        return callback(err, null);
      }

      debug('Removing user:', userData);
      // 物理削除可能なのは、承認待ちユーザー、招待中ユーザーのみ
      // 利用を一度開始したユーザーは論理削除のみ可能
      if (userData.status !== STATUS_REGISTERED && userData.status !== STATUS_INVITED) {
        return callback(new Error('Cannot remove completely the user whoes status is not INVITED'), null);
      }

      userData.remove((err) => {
        if (err) {
          return callback(err, null);
        }

        return callback(null, 1);
      });
    });
  };

  userSchema.statics.resetPasswordByRandomString = function(id) {
    const User = this;

    return new Promise(((resolve, reject) => {
      User.findById(id, (err, userData) => {
        if (!userData) {
          return reject(new Error('User not found'));
        }

        // is updatable check
        // if (userData.isUp
        const newPassword = generateRandomTempPassword();
        userData.setPassword(newPassword);
        userData.save((err, userData) => {
          if (err) {
            return reject(err);
          }

          resolve({ user: userData, newPassword });
        });
      });
    }));
  };

  userSchema.statics.createUsersByInvitation = function(emailList, toSendEmail, callback) {
    validateCrowi();

    const User = this;
    const createdUserList = [];
    const Config = crowi.model('Config');
    const config = crowi.getConfig();

    const mailer = crowi.getMailer();
    if (!Array.isArray(emailList)) {
      debug('emailList is not array');
    }

    async.each(
      emailList,
      (email, next) => {
        const newUser = new User();
        let tmpUsername;
        let password;

        // eslint-disable-next-line no-param-reassign
        email = email.trim();

        // email check
        // TODO: 削除済みはチェック対象から外そう〜
        User.findOne({ email }, (err, userData) => {
          // The user is exists
          if (userData) {
            createdUserList.push({
              email,
              password: null,
              user: null,
            });

            return next();
          }

          /* eslint-disable newline-per-chained-call */
          tmpUsername = `temp_${Math.random().toString(36).slice(-16)}`;
          password = Math.random().toString(36).slice(-16);
          /* eslint-enable newline-per-chained-call */

          newUser.username = tmpUsername;
          newUser.email = email;
          newUser.setPassword(password);
          newUser.createdAt = Date.now();
          newUser.status = STATUS_INVITED;

          const globalLang = Config.globalLang(config);
          if (globalLang != null) {
            newUser.lang = globalLang;
          }

          newUser.save((err, userData) => {
            if (err) {
              createdUserList.push({
                email,
                password: null,
                user: null,
              });
              debug('save failed!! ', err);
            }
            else {
              createdUserList.push({
                email,
                password,
                user: userData,
              });
              debug('saved!', email);
            }

            next();
          });
        });
      },
      (err) => {
        if (err) {
          debug('error occured while iterate email list');
        }

        if (toSendEmail) {
          // TODO: メール送信部分のロジックをサービス化する
          async.each(
            createdUserList,
            (user, next) => {
              if (user.password === null) {
                return next();
              }

              mailer.send({
                to: user.email,
                subject: `Invitation to ${Config.appTitle(config)}`,
                template: path.join(crowi.localeDir, 'en-US/admin/userInvitation.txt'),
                vars: {
                  email: user.email,
                  password: user.password,
                  url: crowi.configManager.getSiteUrl(),
                  appTitle: Config.appTitle(config),
                },
              },
              (err, s) => {
                debug('completed to send email: ', err, s);
                next();
              });
            },
            (err) => {
              debug('Sending invitation email completed.', err);
            },
          );
        }

        debug('createdUserList!!! ', createdUserList);
        return callback(null, createdUserList);
      },
    );
  };

  userSchema.statics.createUserByEmailAndPasswordAndStatus = async function(name, username, email, password, lang, status, callback) {
    const User = this;
    const newUser = new User();

    // check user upper limit
    const isUserCountExceedsUpperLimit = await User.isUserCountExceedsUpperLimit();
    if (isUserCountExceedsUpperLimit) {
      const err = new UserUpperLimitException();
      return callback(err);
    }

    // check email duplication because email must be unique
    const count = await this.count({ email });
    if (count > 0) {
      // eslint-disable-next-line no-param-reassign
      email = generateRandomEmail();
    }

    newUser.name = name;
    newUser.username = username;
    newUser.email = email;
    if (password != null) {
      newUser.setPassword(password);
    }

    const Config = crowi.model('Config');
    const config = crowi.getConfig();
    const globalLang = Config.globalLang(config);
    if (globalLang != null) {
      newUser.lang = globalLang;
    }

    if (lang != null) {
      newUser.lang = lang;
    }
    newUser.createdAt = Date.now();
    newUser.status = status || decideUserStatusOnRegistration();

    newUser.save((err, userData) => {
      if (err) {
        logger.error('createUserByEmailAndPasswordAndStatus failed: ', err);
        return callback(err);
      }

      if (userData.status === STATUS_ACTIVE) {
        userEvent.emit('activated', userData);
      }
      return callback(err, userData);
    });
  };

  /**
   * A wrapper function of createUserByEmailAndPasswordAndStatus with callback
   *
   */
  userSchema.statics.createUserByEmailAndPassword = function(name, username, email, password, lang, callback) {
    this.createUserByEmailAndPasswordAndStatus(name, username, email, password, lang, undefined, callback);
  };

  /**
   * A wrapper function of createUserByEmailAndPasswordAndStatus
   *
   * @return {Promise<User>}
   */
  userSchema.statics.createUser = function(name, username, email, password, lang, status) {
    const User = this;

    return new Promise((resolve, reject) => {
      User.createUserByEmailAndPasswordAndStatus(name, username, email, password, lang, status, (err, userData) => {
        if (err) {
          return reject(err);
        }
        return resolve(userData);
      });
    });
  };

  userSchema.statics.getUsernameByPath = function(path) {
    let username = null;
    const match = path.match(/^\/user\/([^/]+)\/?/);
    if (match) {
      username = match[1];
    }

    return username;
  };

  class UserUpperLimitException {

    constructor() {
      this.name = this.constructor.name;
    }

  }

  userSchema.statics.STATUS_REGISTERED = STATUS_REGISTERED;
  userSchema.statics.STATUS_ACTIVE = STATUS_ACTIVE;
  userSchema.statics.STATUS_SUSPENDED = STATUS_SUSPENDED;
  userSchema.statics.STATUS_DELETED = STATUS_DELETED;
  userSchema.statics.STATUS_INVITED = STATUS_INVITED;
  userSchema.statics.USER_PUBLIC_FIELDS = USER_PUBLIC_FIELDS;
  userSchema.statics.IMAGE_POPULATION = IMAGE_POPULATION;
  userSchema.statics.PAGE_ITEMS = PAGE_ITEMS;

  userSchema.statics.LANG_EN = LANG_EN;
  userSchema.statics.LANG_EN_US = LANG_EN_US;
  userSchema.statics.LANG_EN_GB = LANG_EN_US;
  userSchema.statics.LANG_JA = LANG_JA;

  return mongoose.model('User', userSchema);
};
