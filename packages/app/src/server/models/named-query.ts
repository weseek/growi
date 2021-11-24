/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose, {
  Schema, Model, Document,
} from 'mongoose';

import { getOrCreateModel } from '@growi/core';
import loggerFactory from '../../utils/logger';
import { INamedQuery, SearchResolverName } from '../../interfaces/named-query';

const logger = loggerFactory('growi:models:named-query');

export interface NamedQueryDocument extends INamedQuery, Document {}

export type NamedQueryModel = Model<NamedQueryDocument>

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new Schema<NamedQueryDocument, NamedQueryModel>({
  name: { type: String, required: true, unique: true },
  aliasOf: { type: String },
  resolverName: { type: String, enum: SearchResolverName },
  creator: {
    type: ObjectId, ref: 'User', index: true, default: null,
  },
});

schema.pre('validate', async function(this, next) {
  if (this.aliasOf == null && this.resolverName == null) {
    throw Error('Either of aliasOf and resolverName must not be null.');
  }

  next();
});

export default getOrCreateModel<NamedQueryDocument, NamedQueryModel>('NamedQuery', schema);
