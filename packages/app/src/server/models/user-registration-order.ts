/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Types, Schema, Model, Document,
} from 'mongoose';

import { getOrCreateModel } from '../util/mongoose-utils';

const crypto = require('crypto');
const { listLocaleIds } = require('~/utils/locale-utils');

const STATUS_TEMPORARY = 0;

export interface IUserRegistrationOrder {
  email: string
  password: string
  createdAt: Date
}

export interface UserRegistrationOrderDocument extends IUserRegistrationOrder, Document {}

export interface UserRegistrationOrderModel extends Model<UserRegistrationOrderDocument> {
  hashPassword(passwordseed, password): any
  createUserRegistrationOrder(name:string, username:string, email:string, password:string, callback): any
}

const userRegistrationOrderSchema = new Schema<UserRegistrationOrderDocument, UserRegistrationOrderModel>({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: String,
  status: {
    type: Number, required: true, default: STATUS_TEMPORARY, index: true,
  },
  createdAt: { type: Date, default: Date.now },
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
    status: STATUS_TEMPORARY,
    createdAt: Date.now(),
  }, (err, userData) => {
    if (err) {
      return callback(err);
    }
    return callback(err, userData);
  });
};

export default getOrCreateModel<UserRegistrationOrderDocument, UserRegistrationOrderModel>('UserRegistrationOrder', userRegistrationOrderSchema);
