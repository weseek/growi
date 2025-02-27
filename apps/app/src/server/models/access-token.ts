import crypto from 'crypto';

import type { Ref, IUserHasId } from '@growi/core/dist/interfaces';
import type { Document, Model, Types } from 'mongoose';
import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

import loggerFactory from '~/utils/logger';

import { getOrCreateModel } from '../util/mongoose-utils';

const logger = loggerFactory('growi:models:access-token');

const generateTokenHash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export type IAccessToken = {
  user: Ref<IUserHasId>,
  tokenHash: string,
  expiredAt: Date,
  scope?: string[],
  description?: string,
}

export interface IAccessTokenDocument extends IAccessToken, Document {
  isExpired: () => boolean
}

export interface IAccessTokenModel extends Model<IAccessTokenDocument> {
  generateToken: (user: IUserHasId, expiredAt: Date, scope: string[], description?: string,) => Promise<string>
  deleteToken: (token: string) => Promise<void>
  deleteTokenById: (tokenId: Types.ObjectId) => Promise<void>
  deleteAllTokensByUser: (user: IUserHasId) => Promise<void>
  deleteExpiredToken: () => Promise<void>
  findUserByToken: (token: string) => Promise<IUserHasId>
  findTokenByUser: (user: IUserHasId) => Promise<IAccessTokenDocument[]>
  validateTokenScopes: (token: string, requiredScope: string[]) => Promise<boolean>
}

const accessTokenSchema = new Schema<IAccessTokenDocument, IAccessTokenModel>({
  user: {
    type: Schema.Types.ObjectId, ref: 'User', required: true,
  },
  tokenHash: { type: String, required: true, unique: true },
  expiredAt: { type: Date, required: true, index: true },
  scope: [{ type: String, default: '' }],
  description: { type: String, default: '' },
});

accessTokenSchema.plugin(mongoosePaginate);
accessTokenSchema.plugin(uniqueValidator);

accessTokenSchema.statics.generateToken = async function(user: IUserHasId, expiredAt: Date, scope?: string[], description?: string) {

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = generateTokenHash(token);

  try {
    const { _id } = await this.create({
      user: user._id, tokenHash, expiredAt, scope, description,
    });

    logger.debug('Token generated');
    return {
      token, _id, expiredAt, scope, description,
    };
  }
  catch (err) {
    logger.debug('Failed to generate token');
    throw err;
  }
};

accessTokenSchema.statics.deleteToken = async function(token: string) {
  const tokenHash = generateTokenHash(token);
  return this.deleteOne({ tokenHash });
};

accessTokenSchema.statics.deleteTokenById = async function(tokenId: Types.ObjectId) {
  return this.deleteOne({ _id: tokenId });
};

accessTokenSchema.statics.deleteAllTokensByUser = async function(user: IUserHasId) {
  return this.deleteMany({ user: user._id });
};

accessTokenSchema.statics.deleteExpiredToken = async function() {
  const now = new Date();
  return this.deleteMany({ expiredAt: { $lte: now } });
};

accessTokenSchema.statics.findUserByToken = async function(token: string) {
  const tokenHash = generateTokenHash(token);
  const now = new Date();
  return this.findOne({ tokenHash, expiredAt: { $gt: now } }).populate('user');
};

accessTokenSchema.statics.findTokenByUser = async function(user: IUserHasId) {
  const now = new Date();
  return this.find({ user: user._id, expiredAt: { $gt: now } }).select('_id expiredAt scope description');
};

accessTokenSchema.statics.validateTokenScopes = async function(token: string, requiredScopes: string[]) {
  const tokenHash = generateTokenHash(token);
  const now = new Date();
  const tokenData = await this.findOne({ tokenHash, expiredAt: { $gt: now }, scope: { $all: requiredScopes } });
  return tokenData != null;
};

accessTokenSchema.methods.isExpired = function() {
  return this.expiredAt < new Date();
};

export const AccessToken = getOrCreateModel<IAccessTokenDocument, IAccessToken>('AccessToken', accessTokenSchema);
