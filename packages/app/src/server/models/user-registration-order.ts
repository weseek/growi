import mongoose, {
  Schema, Model, Document,
} from 'mongoose';

import uniqueValidator from 'mongoose-unique-validator';
import crypto from 'crypto';
import { getOrCreateModel } from '../util/mongoose-utils';

export interface IUserRegistrationOrder {
  token: string,
  email: string,
  isRevoked: boolean,
  createdAt: Date,
  expiredAt: Date,
}

export interface UserRegistrationOrderDocument extends IUserRegistrationOrder, Document {
  isExpired(): Promise<boolean>
  revokeOneTimeToken(): Promise<void>
}

export interface UserRegistrationOrderModel extends Model<UserRegistrationOrderDocument> {
  generateOneTimeToken(): string
  createUserRegistrationOrder(email: string): UserRegistrationOrderDocument
}

const schema = new Schema<UserRegistrationOrderDocument, UserRegistrationOrderModel>({
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  isRevoked: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  expiredAt: { type: Date, default: Date.now() + 600000, required: true },
});
schema.plugin(uniqueValidator);

schema.statics.generateOneTimeToken = function() {
  const buf = crypto.randomBytes(256);
  const token = buf.toString('hex');

  return token;
};

schema.statics.createUserRegistrationOrder = async function(email) {
  let token;
  let duplicateToken;

  do {
    token = this.generateOneTimeToken();
    // eslint-disable-next-line no-await-in-loop
    duplicateToken = await this.findOne({ token });
  } while (duplicateToken != null);

  const userRegistrationOrderData = await this.create({ token, email });

  return userRegistrationOrderData;
};

schema.methods.isExpired = function() {
  return this.expiredAt.getTime() < Date.now();
};

schema.methods.revokeOneTimeToken = async function() {
  this.isRevoked = true;
  return this.save();
};

export default getOrCreateModel<UserRegistrationOrderDocument, UserRegistrationOrderModel>('UserRegistrationOrder', schema);
