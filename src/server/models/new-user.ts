import { Schema, Types, Model } from 'mongoose';

import mongoosePaginate from 'mongoose-paginate-v2';
// import path from 'path';
import uniqueValidator from 'mongoose-unique-validator';
import md5 from 'md5';
import crypto from 'crypto';
// import { migrateDeprecatedLocaleId } from '~/utils/locale-utils';
import loggerFactory from '~/utils/logger';
import { config as i18nConfig } from '~/i18n';

import { omitInsecureAttributes } from './serializers/user-serializer';
import { getOrCreateModel } from '../util/mongoose-utils';

import Attachment from '~/server/models/new-attachment';
import ConfigManager from '~/server/service/config-manager';
import AclService from '~/server/service/acl';
import AttachmentService from '~/server/service/attachment';

import { User as IUser } from '~/interfaces/user';

const logger = loggerFactory('growi:models:user');

export const STATUS_REGISTERED = 1;
export const STATUS_ACTIVE = 2;
export const STATUS_SUSPENDED = 3;
export const STATUS_DELETED = 4;
export const STATUS_INVITED = 5;
export const USER_PUBLIC_FIELDS = '_id image isEmailPublished isGravatarEnabled googleId name username email introduction'
  + ' status lang createdAt lastLoginAt admin imageUrlCached';

export const PAGE_ITEMS = 50;

let userEvent;

// // init event
// if (crowi != null) {
//   userEvent = crowi.event('user');
//   userEvent.on('activated', userEvent.onActivated);
// }

type CreateUserByEmail = {
  email:string,
  password?:string,
  user?:User
}


class UserUpperLimitException {

  name: string;

  constructor() {
    this.name = this.constructor.name;
  }

}

const schema:Schema<IUser & Document> = new Schema<IUser & Document>({
  userId: String,
  image: String,
  imageAttachment: { type: Types.ObjectId, ref: 'Attachment' },
  imageUrlCached: String,
  isGravatarEnabled: { type: Boolean, default: false },
  isEmailPublished: { type: Boolean, default: true },
  googleId: String,
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  // === Crowi settings
  // username: { type: String, index: true },
  // email: { type: String, required: true, index: true },
  // === crowi-plus (>= 2.1.0, <2.3.0) settings
  // email: { type: String, required: true, unique: true },
  introduction: String,
  password: String,
  apiToken: { type: String, index: true },
  lang: {
    type: String,
    enum: i18nConfig.allLanguages,
    default: 'en_US',
  },
  status: {
    type: Number, required: true, default: STATUS_ACTIVE, index: true,
  },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
  admin: { type: Boolean, default: 0, index: true },
}, {
  toObject: {
    transform: (doc, ret, opt) => {
      return omitInsecureAttributes(ret);
    },
  },
});
  // eslint-disable-next-line prefer-arrow-callback
// schema.pre('validate', function() {
//   this.lang = migrateDeprecatedLocaleId(this.lang);
// });
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

class User extends Model {

  static configManager: ConfigManager;

  static attachmentService: AttachmentService;

  static aclService: AclService;

  constructor() {
    super();
    this.configManager = new ConfigManager();
    this.attachmentService = new AttachmentService(this.configManager);
    this.aclService = new AclService(this.configManager);
  }

  isPasswordSet() {
    if (this.password) {
      return true;
    }
    return false;
  }

  isPasswordValid(password) {
    return this.password === this.generatePassword(password);
  }

  setPassword(password) {
    this.password = this.generatePassword(password);
    return this;
  }

  isEmailSet() {
    if (this.email) {
      return true;
    }
    return false;
  }

  updateLastLoginAt(lastLoginAt, callback) {
    this.lastLoginAt = lastLoginAt;
    this.save((err, userData) => {
      return callback(err, userData);
    });
  }

  async updateIsGravatarEnabled(isGravatarEnabled) {
    this.isGravatarEnabled = isGravatarEnabled;
    await this.updateImageUrlCached();
    const userData = await this.save();
    return userData;
  }

  async updatePassword(password) {
    this.setPassword(password);
    const userData = await this.save();
    return userData;
  }

  canDeleteCompletely(creatorId) {
    const pageCompleteDeletionAuthority = this.configManager.getConfig('crowi', 'security:pageCompleteDeletionAuthority');
    if (this.admin) {
      return true;
    }
    if (pageCompleteDeletionAuthority === 'anyOne' || pageCompleteDeletionAuthority == null) {
      return true;
    }
    if (pageCompleteDeletionAuthority === 'adminAndAuthor') {
      return (this._id.equals(creatorId));
    }

    return false;
  }

  async updateApiToken() {
    this.apiToken = this.generateApiToken(this);
    const userData = await this.save();
    return userData;
  }

  async updateImage(attachment) {
    this.imageAttachment = attachment;
    await this.updateImageUrlCached();
    return this.save();
  }

  async deleteImage() {
    // the 'image' field became DEPRECATED in v3.3.8
    this.image = undefined;

    if (this.imageAttachment != null) {
      this.attachmentService.removeAttachment(this.imageAttachment._id);
    }

    this.imageAttachment = undefined;
    this.updateImageUrlCached();
    return this.save();
  }

  async updateImageUrlCached() {
    this.imageUrlCached = await this.generateImageUrlCached();
  }

  async generateImageUrlCached(): Promise<string> {
    if (this.isGravatarEnabled) {
      const email = this.email || '';
      const hash = md5(email.trim().toLowerCase());
      return `https://gravatar.com/avatar/${hash}`;
    }
    if (this.image != null) {
      return this.image;
    }
    if (this.imageAttachment != null && this.imageAttachment._id != null) {
      const imageAttachment = await Attachment.findById(this.imageAttachment);
      if (imageAttachment != null) {
        return imageAttachment.filePathProxied;
      }
    }
    return '/images/icons/user.svg';
  }

  updateGoogleId(googleId, callback) {
    this.googleId = googleId;
    this.save((err, userData) => {
      return callback(err, userData);
    });
  }

  deleteGoogleId(callback) {
    return this.updateGoogleId(null, callback);
  }

  async activateInvitedUser(username, name, password) {
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
  }

  async removeFromAdmin() {
    logger.debug('Remove from admin', this);
    this.admin = 0;
    return this.save();
  }

  async makeAdmin() {
    logger.debug('Admin', this);
    this.admin = 1;
    return this.save();
  }

  async asyncMakeAdmin(callback) {
    this.admin = 1;
    return this.save();
  }

  async statusActivate() {
    logger.debug('Activate User', this);
    this.status = STATUS_ACTIVE;
    const userData = await this.save();
    return userEvent.emit('activated', userData);
  }

  async statusSuspend() {
    logger.debug('Suspend User', this);
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
    return this.save();
  }

  async statusDelete() {
    logger.debug('Delete User', this);

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
    return this.save();
  }

  static getUserStatusLabels() {
    const userStatus = {};
    userStatus[STATUS_REGISTERED] = 'Approval Pending';
    userStatus[STATUS_ACTIVE] = 'Active';
    userStatus[STATUS_SUSPENDED] = 'Suspended';
    userStatus[STATUS_DELETED] = 'Deleted';
    userStatus[STATUS_INVITED] = 'Invited';

    return userStatus;
  }

  static decideUserStatusOnRegistration():number {

    const isInstalled = this.configManager.getConfig('crowi', 'app:installed');
    if (!isInstalled) {
      return STATUS_ACTIVE; // is this ok?
    }

    // status decided depends on registrationMode
    const registrationMode = this.configManager.getConfig('crowi', 'security:registrationMode');
    switch (registrationMode) {
      case this.aclService.labels.SECURITY_REGISTRATION_MODE_OPEN:
        return STATUS_ACTIVE;
      case this.aclService.labels.SECURITY_REGISTRATION_MODE_RESTRICTED:
      case this.aclService.labels.SECURITY_REGISTRATION_MODE_CLOSED: // 一応
        return STATUS_REGISTERED;
      default:
        return STATUS_ACTIVE; // どっちにすんのがいいんだろうな
    }
  }


  static generateRandomTempPassword():string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!=-_';
    let password = '';
    const len = 12;

    for (let i = 0; i < len; i++) {
      const randomPoz = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomPoz, randomPoz + 1);
    }

    return password;
  }

  static generateRandomEmail():string {
    const randomstr = this.generateRandomTempPassword();
    return `change-it-${randomstr}@example.com`;
  }

  static generatePassword(password:string):string {

    const hasher = crypto.createHash('sha256');
    hasher.update(process.env.PASSWORD_SEED + password);

    return hasher.digest('hex');
  }

  generateApiToken(user) {
    const hasher = crypto.createHash('sha256');
    hasher.update((new Date()).getTime() + user._id);

    return hasher.digest('base64');
  }


  static isEmailValid(email, callback):boolean {
    const whitelist = this.configManager.getConfig('crowi', 'security:registrationWhiteList');

    if (Array.isArray(whitelist) && whitelist.length > 0) {
      return whitelist.some((allowedEmail) => {
        const re = new RegExp(`${allowedEmail}$`);
        return re.test(email);
      });
    }

    return true;
  }

  static findUsers(options, callback) {
    const sort = options.sort || { status: 1, createdAt: 1 };

    this.find()
      .sort(sort)
      .skip(options.skip || 0)
      .limit(options.limit || 21)
      .exec((err, userData) => {
        callback(err, userData);
      });
  }

  static findAllUsers(option) {
    // eslint-disable-next-line no-param-reassign
    option = option || {};

    const sort = option.sort || { createdAt: -1 };
    const fields = option.fields || {};

    let status = option.status || [STATUS_ACTIVE, STATUS_SUSPENDED];
    if (!Array.isArray(status)) {
      status = [status];
    }

    return this.find()
      .or(status.map((s) => { return { status: s } }))
      .select(fields)
      .sort(sort);
  }

  static findUsersByIds(ids, option) {
    // eslint-disable-next-line no-param-reassign
    option = option || {};

    const sort = option.sort || { createdAt: -1 };
    const status = option.status || STATUS_ACTIVE;
    const fields = option.fields || {};

    return this.find({ _id: { $in: ids }, status })
      .select(fields)
      .sort(sort);
  }

  static async findAdmins() {
    return this.find({ admin: true });
  }

  static findUserByUsername(username) {
    if (username == null) {
      return Promise.resolve(null);
    }
    return this.findOne({ username });
  }

  static findUserByApiToken(apiToken) {
    if (apiToken == null) {
      return Promise.resolve(null);
    }
    return this.findOne({ apiToken });
  }

  static findUserByGoogleId(googleId, callback) {
    if (googleId == null) {
      callback(null, null);
    }
    this.findOne({ googleId }, (err, userData) => {
      callback(err, userData);
    });
  }

  static findUserByUsernameOrEmail(usernameOrEmail, password, callback) {
    this.findOne()
      .or([
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ])
      .exec((err, userData) => {
        callback(err, userData);
      });
  }

  static findUserByEmailAndPassword(email, password, callback) {
    const hashedPassword = this.generatePassword(password);
    this.findOne({ email, password: hashedPassword }, (err, userData) => {
      callback(err, userData);
    });
  }

  static async isUserCountExceedsUpperLimit():Promise<boolean> {
    const userUpperLimit = this.configManager.getConfig('crowi', 'security:userUpperLimit');

    const activeUsers = await this.countListByStatus(STATUS_ACTIVE);
    if (userUpperLimit <= activeUsers) {
      return true;
    }

    return false;
  }

  static async countListByStatus(status) {
    const conditions = { status };

    // TODO count は非推奨。mongoose のバージョンアップ後に countDocuments に変更する。
    return this.count(conditions);
  }

  static async isRegisterableUsername(username) {
    let usernameUsable = true;

    const userData = await this.findOne({ username });
    if (userData) {
      usernameUsable = false;
    }
    return usernameUsable;
  }

  static isRegisterable(email, username, callback) {
    let emailUsable = true;
    let usernameUsable = true;

    // username check
    this.findOne({ username }, (err, userData) => {
      if (userData) {
        usernameUsable = false;
      }

      // email check
      this.findOne({ email }, (err, userData) => {
        if (userData) {
          emailUsable = false;
        }

        if (!emailUsable || !usernameUsable) {
          return callback(false, { email: emailUsable, username: usernameUsable });
        }

        return callback(true, {});
      });
    });
  }

  static async resetPasswordByRandomString(id) {
    const user = await this.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    const newPassword = this.generateRandomTempPassword();
    user.setPassword(newPassword);
    await user.save();

    return newPassword;
  }

  static async createUserByEmail(email):Promise<CreateUserByEmail> {
    const newUser = new this();

    /* eslint-disable newline-per-chained-call */
    const tmpUsername = `temp_${Math.random().toString(36).slice(-16)}`;
    const password = Math.random().toString(36).slice(-16);
    /* eslint-enable newline-per-chained-call */

    newUser.username = tmpUsername;
    newUser.email = email;
    newUser.setPassword(password);
    newUser.createdAt = Date.now();
    newUser.status = STATUS_INVITED;

    const globalLang = this.configManager.getConfig('crowi', 'app:globalLang');
    if (globalLang != null) {
      newUser.lang = globalLang;
    }

    try {
      const newUserData = await newUser.save();
      return {
        email,
        password,
        user: newUserData,
      };
    }
    catch (err) {
      return {
        email,
      };
    }
  }

  static async createUsersByEmailList(emailList:string[]):Promise<{existingEmailList:string[], createdUserList:CreateUserByEmail[]}> {
    // check exists and get list of try to create
    const existingUserList = await this.find({ email: { $in: emailList }, userStatus: { $ne: STATUS_DELETED } });
    const existingEmailList = existingUserList.map((user) => { return user.email });
    const creationEmailList = emailList.filter((email) => { return existingEmailList.indexOf(email) === -1 });

    const createdUserList:CreateUserByEmail[] = [];
    await Promise.all(creationEmailList.map(async(email) => {
      const createdEmail = await this.createUserByEmail(email);
      createdUserList.push(createdEmail);
    }));

    return { existingEmailList, createdUserList };
  }

  static async sendEmailbyUserList(userList) {
    // TODO enable appService and mailService
    // const { appService, mailService } = crowi;
    // const appTitle = appService.getAppTitle();

    // await Promise.all(userList.map(async(user) => {
    //   if (user.password == null) {
    //     return;
    //   }

    //   try {
    //     return mailService.send({
    //       to: user.email,
    //       subject: `Invitation to ${appTitle}`,
    //       template: path.join(crowi.localeDir, 'en_US/admin/userInvitation.txt'),
    //       vars: {
    //         email: user.email,
    //         password: user.password,
    //         url: crowi.appService.getSiteUrl(),
    //         appTitle,
    //       },
    //     });
    //   }
    //   catch (err) {
    //     return logger.debug('fail to send email: ', err);
    //   }
    // }));

  }

  static async createUsersByInvitation(emailList, toSendEmail) {

    if (!Array.isArray(emailList)) {
      logger.debug('emailList is not array');
    }

    const afterWorkEmailList = await this.createUsersByEmailList(emailList);

    if (toSendEmail) {
      await this.sendEmailbyUserList(afterWorkEmailList.createdUserList);
    }

    return afterWorkEmailList;
  }

  static async createUserByEmailAndPasswordAndStatus(name, username, email, password, lang, status, callback):Promise<void> {
    const newUser = new this();

    // check user upper limit
    const isUserCountExceedsUpperLimit = await this.isUserCountExceedsUpperLimit();
    if (isUserCountExceedsUpperLimit) {
      const err = new UserUpperLimitException();
      return callback(err);
    }

    // check email duplication because email must be unique
    const count = await this.count({ email });
    if (count > 0) {
      // eslint-disable-next-line no-param-reassign
      email = this.generateRandomEmail();
    }

    newUser.name = name;
    newUser.username = username;
    newUser.email = email;
    if (password != null) {
      newUser.setPassword(password);
    }


    const globalLang = this.configManager.getConfig('crowi', 'app:globalLang');
    if (globalLang != null) {
      newUser.lang = globalLang;
    }

    if (lang != null) {
      newUser.lang = lang;
    }
    newUser.createdAt = Date.now();
    newUser.status = status || this.decideUserStatusOnRegistration();

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
  }

  /**
   * A wrapper function of createUserByEmailAndPasswordAndStatus with callback
   *
   */
  static createUserByEmailAndPassword(name, username, email, password, lang, callback) {
    this.createUserByEmailAndPasswordAndStatus(name, username, email, password, lang, undefined, callback);
  }

  /**
   * A wrapper function of createUserByEmailAndPasswordAndStatus
   *
   * @return {Promise<User>}
   */
  static createUser(name, username, email, password, lang, status) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const User = this;

    return new Promise((resolve, reject) => {
      User.createUserByEmailAndPasswordAndStatus(name, username, email, password, lang, status, (err, userData) => {
        if (err) {
          return reject(err);
        }
        return resolve(userData);
      });
    });
  }

  static getUsernameByPath(path) {
    let username = null;
    const match = path.match(/^\/user\/([^/]+)\/?/);
    if (match) {
      username = match[1];
    }

    return username;
  }

}


schema.loadClass(User);
// TODO rename model name
export default getOrCreateModel<IUser & Document>('NewUser', schema);
