import crypto from 'crypto';

import type { Ref, IUserHasId } from '@growi/core/dist/interfaces';
import type {
  Document, Model, Types, HydratedDocument,
} from 'mongoose';
import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

import loggerFactory from '~/utils/logger';

import { getOrCreateModel } from '../util/mongoose-utils';

const logger = loggerFactory('growi:models:access-token');

const generateTokenHash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

type GenerateTokenResult = {
  token: string,
  _id: Types.ObjectId,
  expiredAt: Date,
  scope?: string[],
  description?: string,
}

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
  generateToken: (userId: Types.ObjectId, expiredAt: Date, scope: string[], description?: string,) => Promise<GenerateTokenResult>
  deleteToken: (token: string) => Promise<void>
  deleteTokenById: (tokenId: Types.ObjectId) => Promise<void>
  deleteAllTokensByUserId: (userId: Types.ObjectId) => Promise<void>
  deleteExpiredToken: () => Promise<void>
  findUserIdByToken: (token: string) => Promise<HydratedDocument<IAccessTokenDocument> | null>
  findTokenByUserId: (userId: Types.ObjectId) => Promise<HydratedDocument<IAccessTokenDocument>[] | null>
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

accessTokenSchema.statics.generateToken = async function(userId: Types.ObjectId, expiredAt: Date, scope?: string[], description?: string) {

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = generateTokenHash(token);

  try {
    const { _id } = await this.create({
      user: userId, tokenHash, expiredAt, scope, description,
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
  await this.deleteOne({ tokenHash });
};

accessTokenSchema.statics.deleteTokenById = async function(tokenId: Types.ObjectId) {
  await this.deleteOne({ _id: tokenId });
};

accessTokenSchema.statics.deleteAllTokensByUserId = async function(userId: Types.ObjectId) {
  await this.deleteMany({ user: userId });
};

accessTokenSchema.statics.deleteExpiredToken = async function() {
  const now = new Date();
  await this.deleteMany({ expiredAt: { $lte: now } });
};

accessTokenSchema.statics.findUserIdByToken = async function(token: string) {
  const tokenHash = generateTokenHash(token);
  const now = new Date();
  return this.findOne({ tokenHash, expiredAt: { $gt: now } }).select('user');
};

accessTokenSchema.statics.findTokenByUserId = async function(userId: Types.ObjectId) {
  const now = new Date();
  return this.find({ user: userId, expiredAt: { $gt: now } }).select('_id expiredAt scope description');
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

export const AccessToken = getOrCreateModel<IAccessTokenDocument, IAccessTokenModel>('AccessToken', accessTokenSchema);
