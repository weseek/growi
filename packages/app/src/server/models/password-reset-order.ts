import mongoose, {
  Schema, Model, Document,
} from 'mongoose';

import uniqueValidator from 'mongoose-unique-validator';
import crypto from 'crypto';
import { getOrCreateModel } from '@growi/core';

const ObjectId = mongoose.Schema.Types.ObjectId;

export interface IPasswordResetOrder {
  token: string,
  email: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relatedUser: any,
  isRevoked: boolean,
  createdAt: Date,
  expiredAt: Date,
}

export interface PasswordResetOrderDocument extends IPasswordResetOrder, Document {
  isExpired(): Promise<boolean>
  revokeOneTimeToken(): Promise<void>
}

export interface PasswordResetOrderModel extends Model<PasswordResetOrderDocument> {
  generateOneTimeToken(): string
  createPasswordResetOrder(email: string): PasswordResetOrderDocument
}

const schema = new Schema<PasswordResetOrderDocument, PasswordResetOrderModel>({
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  relatedUser: { type: ObjectId, ref: 'User' },
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

schema.statics.createPasswordResetOrder = async function(email) {
  let token;
  let duplicateToken;

  do {
    token = this.generateOneTimeToken();
    // eslint-disable-next-line no-await-in-loop
    duplicateToken = await this.findOne({ token });
  } while (duplicateToken != null);

  const passwordResetOrderData = await this.create({ token, email });

  return passwordResetOrderData;
};

schema.methods.isExpired = function() {
  return this.expiredAt.getTime() < Date.now();
};

schema.methods.revokeOneTimeToken = async function() {
  this.isRevoked = true;
  return this.save();
};

export default getOrCreateModel<PasswordResetOrderDocument, PasswordResetOrderModel>('PasswordResetOrder', schema);
