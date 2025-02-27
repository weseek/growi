import crypto from 'crypto';

import type { Document, Model, Types } from 'mongoose';
import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

import loggerFactory from '~/utils/logger';

import { getOrCreateModel } from '../util/mongoose-utils';

const logger = loggerFactory('growi:models:comment');

const generateTokenHash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export type IAccessToken = {
  userId: Types.ObjectId,
  tokenHash: string,
  expiredAt: Date,
  scope: string[],
  description: string,
}

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
  deleteAllTokensByUserId: (userId: Types.ObjectId) => Promise<void>
  deleteExpiredToken: () => Promise<void>
  findUserIdByToken: (token: string) => Promise<IAccessTokenDocument>
  findTokenByUserId: (userId: Types.ObjectId) => Promise<IAccessTokenDocument[]>
  validateTokenScopes: (token: string, requiredScope: string[]) => Promise<boolean>
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
  const tokenHash = generateTokenHash(token);

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

IAccessTokenSchema.statics.deleteToken = async function(userId: Types.ObjectId, token: string) {
  const tokenHash = generateTokenHash(token);
  return this.deleteOne({ userId, tokenHash });
};

IAccessTokenSchema.statics.deleteAllTokensByUserId = async function(userId: Types.ObjectId) {
  return this.deleteMany({ userId });
};

IAccessTokenSchema.statics.deleteExpiredToken = async function() {
  const now = new Date();
  return this.deleteMany({ expiredAt: { $lte: now } });
};

IAccessTokenSchema.statics.findUserIdByToken = async function(token: string) {
  const tokenHash = generateTokenHash(token);
  const now = new Date();
  return this.findOne({ tokenHash, expiredAt: { $gt: now } }).select('userId');
};

IAccessTokenSchema.statics.findTokenByUserId = async function(userId: Types.ObjectId) {
  const now = new Date();
  return this.find({ userId, expiredAt: { $gt: now } }).select('expiredAt scope description');
};

IAccessTokenSchema.statics.validateTokenScopes = async function(token: string, requiredScopes: string[]) {
  const tokenHash = generateTokenHash(token);
  const now = new Date();
  const tokenData = await this.findOne({ tokenHash, expiredAt: { $gt: now }, scope: { $all: requiredScopes } });
  return tokenData != null;
};

IAccessTokenSchema.methods.isExpired = function() {
  return this.expiredAt < new Date();
};

export const AccessToken = getOrCreateModel<IAccessTokenDocument, IAccessToken>('AccessToken', IAccessTokenSchema);
