/* eslint-disable no-use-before-define */
import loggerFactory from '~/utils/logger';

const debug = require('debug')('growi:models:user-registration-order');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');
const md5 = require('md5');

const ObjectId = mongoose.Schema.Types.ObjectId;
const crypto = require('crypto');

const { listLocaleIds, migrateDeprecatedLocaleId } = require('~/utils/locale-utils');

const { omitInsecureAttributes } = require('./serializers/user-serializer');

const logger = loggerFactory('growi:models:user-registration-order');

module.exports = function(crowi) {

  const STATUS_TEMPORARY = 0;
  const PAGE_ITEMS = 50;

  let userEvent;

  // init event
  if (crowi != null) {
    userEvent = crowi.event('user');
    userEvent.on('activated', userEvent.onActivated);
  }

  const userRegistrationOrderSchema = new mongoose.Schema({
    userId: String,
    image: String,
    imageAttachment: { type: ObjectId, ref: 'Attachment' },
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
      enum: listLocaleIds(),
      default: 'en_US',
    },
    status: {
      type: Number, required: true, default: STATUS_TEMPORARY, index: true,
    },
    createdAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date },
    admin: { type: Boolean, default: 0, index: true },
    isInvitationEmailSended: { type: Boolean, default: false },
  }, {
    toObject: {
      transform: (doc, ret, opt) => {
        return omitInsecureAttributes(ret);
      },
    },
  });
  // eslint-disable-next-line prefer-arrow-callback
  userRegistrationOrderSchema.pre('validate', function() {
    this.lang = migrateDeprecatedLocaleId(this.lang);
  });
  userRegistrationOrderSchema.plugin(mongoosePaginate);
  userRegistrationOrderSchema.plugin(uniqueValidator);

  function validateCrowi() {
    if (crowi == null) {
      throw new Error('"crowi" is null. Init User model with "crowi" argument first.');
    }
  }

  function generatePassword(password) {
    validateCrowi();

    const hasher = crypto.createHash('sha256');
    hasher.update(crowi.env.PASSWORD_SEED + password);

    return hasher.digest('hex');
  }

  userRegistrationOrderSchema.methods.setPassword = function(password) {
    this.password = generatePassword(password);
    return this;
  };

  userRegistrationOrderSchema.statics.createUserRegistrationOrder = async function(name, username, email, password, lang, callback) {
    const UserRegistrationOrderSchema = this;
    const newUser = new UserRegistrationOrderSchema();

    newUser.name = name;
    newUser.username = username;
    newUser.email = email;
    if (password != null) {
      newUser.setPassword(password);
    }

    const configManager = crowi.configManager;

    // Default email show/hide is up to the administrator
    newUser.isEmailPublished = configManager.getConfig('crowi', 'customize:isEmailPublishedForNewUser');

    const globalLang = configManager.getConfig('crowi', 'app:globalLang');
    if (globalLang != null) {
      newUser.lang = globalLang;
    }

    if (lang != null) {
      newUser.lang = lang;
    }
    newUser.createdAt = Date.now();
    newUser.status = STATUS_TEMPORARY; // Force status value

    newUser.save((err, userData) => {
      if (err) {
        logger.error('createUserByEmailAndPasswordAndStatus failed: ', err);
        return callback(err);
      }
      return callback(err, userData);
    });
  };

  /**
   * A wrapper function of createUserByEmailAndPasswordAndStatus with callback
   *
   */
  userRegistrationOrderSchema.statics.createUserByEmailAndPassword = function(name, username, email, password, lang, callback) {
    this.createUserByEmailAndPasswordAndStatus(name, username, email, password, lang, undefined, callback);
  };

  userRegistrationOrderSchema.statics.STATUS_TEMPORARY = STATUS_TEMPORARY;

  return mongoose.model('UserRegistrationOrder', userRegistrationOrderSchema);
};
