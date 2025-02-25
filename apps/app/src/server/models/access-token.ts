import crypto from 'crypto';

import type { IAccessToken } from '@growi/core';
import type { Document, Model, Types } from 'mongoose';
import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

import loggerFactory from '~/utils/logger';

import { getOrCreateModel } from '../util/mongoose-utils';

const logger = loggerFactory('growi:models:comment');

export interface IAccessTokenDocument extends IAccessToken, Document {
  userId: Types.ObjectId,
  tokenHash: string,
  expiredAt: Date,
  scope: string[],
  description: string,

  isExpired: () => boolean
}

export interface IAccessTokenModel extends Model<IAccessTokenDocument> {
  generateToken: (userId: Types.ObjectId, expiredAt: Date, scope: string[], description?: string,) => Promise<string>
  deleteToken: (model: IAccessTokenModel) => Promise<void>
  findUserIdByToken: (token: string) => Promise<IAccessTokenDocument>
  findTokenByUserId: (userId: Types.ObjectId) => Promise<IAccessTokenDocument[]>
}

const IAccessTokenSchema = new Schema<IAccessTokenDocument, IAccessTokenModel>({
  userId: {
    type: Schema.Types.ObjectId, ref: 'User', required: true,
  },
  tokenHash: { type: String, required: true, unique: true },
  expiredAt: { type: Date, required: true, index: true },
  scope: [{ type: String, default: '' }],
  description: { type: String, default: '' },
});

IAccessTokenSchema.plugin(mongoosePaginate);
IAccessTokenSchema.plugin(uniqueValidator);

IAccessTokenSchema.statics.generateToken = async function(userId: Types.ObjectId, expiredAt: Date, scope?: string[], description?: string) {

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // TODO: scope validation
  try {
    await this.create({
      userId, tokenHash, expiredAt, scope, description,
    });

    logger.debug('Token generated');
    return token;
  }
  catch (err) {
    logger.debug('Failed to generate token');
    throw err;
  }
};

IAccessTokenSchema.statics.deleteToken = async function(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return this.deleteOne({ tokenHash });
};

IAccessTokenSchema.statics.deleteAllTokensByUserId = async function(userId: Types.ObjectId) {
  return this.deleteMany({ userId });
};

IAccessTokenSchema.statics.deleteExpiredToken = async function() {
  const now = new Date();
  return this.deleteMany({ expiredAt: { $lte: now } });
};

IAccessTokenSchema.statics.findUserIdByToken = async function(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date();
  return this.findOne({ tokenHash, expiredAt: { $gt: now } }).select('userId');
};

IAccessTokenSchema.statics.findTokenByUserId = async function(userId: Types.ObjectId) {
  const now = new Date();
  return this.find({ userId, expiredAt: { $gt: now } }).select('expiredAt scope description');
};

IAccessTokenSchema.methods.isExpired = function() {
  return this.expiredAt < new Date();
};


export const AccessToken = getOrCreateModel<IAccessTokenDocument, IAccessToken>('AccessToken', IAccessTokenSchema);
