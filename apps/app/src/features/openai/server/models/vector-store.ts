import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

export const VectorStoreScopeType = {
  PUBLIC: 'public',
} as const;

export type VectorStoreScopeType = typeof VectorStoreScopeType[keyof typeof VectorStoreScopeType];

const VectorStoreScopeTypes = Object.values(VectorStoreScopeType);
interface VectorStore {
  vectorStoreId: string
  scopeType: VectorStoreScopeType
  isDeleted: boolean
}

export interface VectorStoreDocument extends VectorStore, Document {}

type VectorStoreModel = Model<VectorStore>

const schema = new Schema<VectorStoreDocument, VectorStoreModel>({
  vectorStoreId: {
    type: String,
    required: true,
    unique: true,
  },
  scopeType: {
    enum: VectorStoreScopeTypes,
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true,
  },
});

export default getOrCreateModel<VectorStoreDocument, VectorStoreModel>('VectorStore', schema);
