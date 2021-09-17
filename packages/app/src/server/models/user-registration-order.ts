/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Types, Schema, Model, Document,
} from 'mongoose';

import { getOrCreateModel } from '../util/mongoose-utils';

const crypto = require('crypto');
const { listLocaleIds } = require('~/utils/locale-utils');

const STATUS_TEMPORARY = 0;

export interface IUserRegistrationOrder {
  userId: string
  image: string
  imageAttachment: Schema.Types.ObjectId
  imageUrlCached: string
  isGravatarEnabled: boolean
  isEmailPublished: boolean
  googleId: string
  name: string
  username: string
  email: string
  introduction: string
  password: string
  apiToken: string
  lang: string
  status: number
  createdAt: Date
  lastLoginAt: Date
  admin: boolean
  isInvitationEmailSended: boolean
}

export interface UserRegistrationOrderDocument extends IUserRegistrationOrder, Document {}

export interface UserRegistrationOrderModel extends Model<UserRegistrationOrderDocument> {
  hashPassword(passwordseed, password): any
  createUserRegistrationOrder(name:string, username:string, email:string, password:string, callback): any
}

const userRegistrationOrderSchema = new Schema<UserRegistrationOrderDocument, UserRegistrationOrderModel>({
  userId: String,
  image: String,
  imageAttachment: { type: Schema.Types.ObjectId, ref: 'Attachment' },
  imageUrlCached: String,
  isGravatarEnabled: { type: Boolean, default: false },
  isEmailPublished: { type: Boolean, default: true },
  googleId: String,
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
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
});

userRegistrationOrderSchema.statics.hashPassword = function(passwordseed, password) {
  const hasher = crypto.createHash('sha256');
  hasher.update(passwordseed + password); // TODO: call passwordseed by crowi.env.PASSWORD_SEED?

  return hasher.digest('hex');
};

// TODO: Remove passwordseed parameter, call passwordseed by crowi.env.PASSWORD_SEED from this model instead?
userRegistrationOrderSchema.statics.createUserRegistrationOrder = async function(name, username, email, password, passwordseed, callback) {
  this.create({
    name,
    username,
    email,
    password: this.hashPassword(passwordseed, password),
    createdAt: Date.now(),
    status: STATUS_TEMPORARY,
  }, (err, userData) => {
    if (err) {
      return callback(err);
    }
    return callback(err, userData);
  });
};

export default getOrCreateModel<UserRegistrationOrderDocument, UserRegistrationOrderModel>('UserRegistrationOrder', userRegistrationOrderSchema);
